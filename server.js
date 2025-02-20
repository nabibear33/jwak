const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const iconv = require("iconv-lite");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
let count = 0;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.post("/execute", (req, res) => {
    count = count + 1;
    console.log(`Get Request... Total request count ${count}`);
    const { code, inputs } = req.body;

    const filename = `request-${uuidv4()}.jwak`;
    // console.log(`${uuidv4()}`);
    fs.writeFileSync(filename, code);
    
    // 프로세스를 spawn하여 실행 (stdin을 통해 입력 제공 가능)
    const process = spawn("python", ["-m", "lang_shung_jwak", filename], { encoding: "buffer" });

    let output = "";
    let errorOutput = "";

    // 표준 출력을 실시간으로 수집
    process.stdout.on("data", (data) => {
        output += iconv.decode(data, "utf-8");
        // console.log(iconv.decode(data, "utf-8"));
    });

    // 표준 에러 출력 수집
    process.stderr.on("data", (data) => {
        errorOutput += iconv.decode(data, "utf-8");
        // console.log(iconv.decode(data, "utf-8"));
    });

    // 입력값이 있으면 하나씩 입력 (개행 포함)
    if (inputs && inputs.length > 0) {
        inputs.forEach(input => {
            process.stdin.write(input + "\n");
        });
        process.stdin.end(); // 입력 완료
    }

    // 실행 종료 후 응답 반환
    process.on("close", (code) => {
        fs.unlinkSync(filename);
        if (code === 0) {
            res.json({ output });
        } else {
            res.json({ output: errorOutput });
        }
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server available on port ${server.address().port}`);
});
