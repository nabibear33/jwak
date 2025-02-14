const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 허용 (GitHub Pages에서 요청 가능하게 설정)
app.use(cors());

app.get("/notify", (req, res) => {
    console.log("알림 요청을 받았습니다!");
    res.json({ message: "Render 서버에서 알림을 보냈습니다!" });
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});