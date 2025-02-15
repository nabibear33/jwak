// Monaco Editor 로드 및 설정
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });

require(["vs/editor/editor.main"], function () {
    // Monaco Editor 초기화
    window.editor = monaco.editor.create(document.getElementById("editor-container"), {
        value: '교주님',
        language: "python",
        theme: "vs-dark",
        automaticLayout: true
    });
});

const files = [
    ['Hello, world!', 'hello_world.txt'],
    ['구구단', 'gugudan.txt'],
    ['피보나치 수열', 'fibonacci.txt'],
    ['무한 루프', 'infinite_loop.txt'],
    ['문법 오류', 'syntax_error.txt'],
];

const examples = {};
const exampleBtn = document.getElementById("example-btn");
const exampleDropdown = document.getElementById("exampleDropdown");

// 파일 로드 전 버튼 비활성화
exampleBtn.disabled = true;

async function loadFiles() {
    for (const file of files) {
        const response = await fetch(`example/${file[1]}`);
        const content = await response.text();

        const key = file[1].replace('.txt', '');
        examples[key] = {
            name: file[0],
            code: content
        };
    }

    // 로드 완료 후 드롭다운 업데이트
    updateDropdown();
}

function updateDropdown() {
    exampleDropdown.innerHTML = ""; // 기존 항목 초기화

    Object.keys(examples).forEach(key => {
        const item = document.createElement("div");
        item.className = "example-item";
        item.textContent = examples[key].name;
        item.setAttribute("data-example", key);

        item.addEventListener("click", function () {
            window.editor.setValue(examples[key].code);
            console.log("Example changed to:", examples[key].name);
            exampleDropdown.style.display = "none";
        });

        exampleDropdown.appendChild(item);
    });

    // 버튼 활성화
    exampleBtn.disabled = false;
}

// 파일 로드 시작
loadFiles();

// 드롭다운 표시/숨기기
exampleBtn.addEventListener("click", function () {
    exampleDropdown.style.display = exampleDropdown.style.display === "block" ? "none" : "block";
});

// 클릭이 드롭다운 외부에서 발생하면 닫기
document.addEventListener("click", function (event) {
    if (exampleDropdown.style.display === "block" && !exampleDropdown.contains(event.target) && event.target !== exampleBtn) {
        exampleDropdown.style.display = "none";
    }
});


// XTerm.js 터미널 설정
const fitAddon = new window.FitAddon.FitAddon();
const term = new Terminal({
    convertEol: true,
});
term.loadAddon(fitAddon);
term.open(document.getElementById("output-terminal"));
term.writeln("Click on RUN button to see the output");


// Split.js 설정 (드래그 가능하도록)
Split(["#editor-container", "#right-panel"], {
    sizes: [65, 35], // 초기 크기 비율
    minSize: 200,    // 패널 최소 크기
    gutterSize: 6,   // 실제 보이는 구분선 크기
    cursor: "e-resize", // 기본 드래그 커서
    onDragEnd: () => {
        fitAddon.fit();  // ✅ 터미널 크기 자동 조정
    }
});

fitAddon.fit();

// 브라우저 창 크기 변경 시 터미널 크기 조정
window.addEventListener("resize", () => {
    fitAddon.fit();
});


// 입력창과 터미널 사이 분할
Split(["#input-container", "#terminal-container"], {
    direction: "vertical", // 세로 분할
    sizes: [20, 80], // 입력창 20%, 터미널 80%
    minSize: 100, // 최소 크기 제한
    gutterSize: 6, // 구분선 크기
    cursor: "n-resize",
});

document.querySelectorAll(".gutter-horizontal").forEach(gutter => {
    gutter.addEventListener("mouseenter", () => {
        gutter.style.cursor = "e-resize";
    });
});

document.querySelectorAll(".gutter-vertical").forEach(gutter => {
    gutter.addEventListener("mouseenter", () => {
        gutter.style.cursor = "n-resize";
    });
});

// RUN 버튼 이벤트
document.getElementById("run-btn").addEventListener("click", async function () {
    const runButton = this; // 현재 클릭된 버튼
    runButton.classList.add("loading"); // 로딩 효과 추가
    runButton.disabled = true; // 버튼 비활성화

    const code = editor.getValue(); // 코드 가져오기
    const userInput = document.getElementById("stdin-input").value.trim().split("\n");

    term.clear();
    term.writeln("Running your code...\n");
    term.writeln("jwak@jwak-server ~$ python main.py\n");

    try {
        const response = await fetch("https://jwak-interpreter.onrender.com/execute", {
        // const response = await fetch("http://localhost:3000/execute", {            
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, inputs: userInput }),
        });
        
        const result = await response.json();
        term.writeln(result.output);

    } catch (error) {
        term.writeln("Error: Unable to connect to server.");
        console.error("Fetch error:", error);
    }

    // 실행이 끝나면 버튼 원래대로 복구
    runButton.classList.remove("loading"); // 로딩 효과 제거
    runButton.disabled = false; // 버튼 다시 활성화
});

// 이벤트 리스너를 DOM이 완전히 로드된 후 등록
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("usage-btn").addEventListener("click", function() {
        // console.log("usage button clicked");
        document.getElementById("popup-overlay").classList.remove("hidden");
        document.getElementById("usage-popup").classList.remove("hidden");
    });

    document.querySelector(".close-btn").addEventListener("click", function() {
        // console.log("close button clicked");
        document.getElementById("popup-overlay").classList.add("hidden");
        document.getElementById("usage-popup").classList.add("hidden");
    });

    document.getElementById("popup-overlay").addEventListener("click", function() {
        // console.log("overlay clicked");
        document.getElementById("usage-popup").classList.add("hidden");
        this.classList.add("hidden");
    });
});