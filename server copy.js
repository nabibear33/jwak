const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const iconv = require("iconv-lite");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.post("/execute", (req, res) => {
    console.log(`Get Request`);
    const { code } = req.body;

    const filename = "request.jwak";
    fs.writeFileSync(filename, code);
    
    exec(`python -m lang_shung_jwak ${filename}`, { encoding: "buffer" }, (error, stdout, stderr) => {
        stdout = iconv.decode(stdout, "euc-kr");
        stderr = iconv.decode(stderr, "euc-kr");
        console.log((error, stdout, stderr));
        if (error) {
            res.json({ output: stderr });
        } else {
            res.json({ output: stdout });
        }

        fs.unlinkSync(filename);
    });
});

app.listen(PORT, () => {
    console.log(`Server available`);
});
