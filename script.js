// ==================== KONFIGURASI ====================
const DATA_URLS = {
    hiragana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/hiragana.json',
    katakana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katakana.json',
    kotoba: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katabenda.json'
};

// State global
let currentMode = null;
let quizData = [];
let shuffledQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let selectedAnswer = null;
let currentOptions = [];
let currentCorrectAnswer = '';

// ==================== HELPER FUNCTIONS ====================
function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function generateOptions(question, allData) {
    const correct = question.jawaban;
    const others = allData.filter(item => item.jawaban !== correct).map(item => item.jawaban);
    const shuffledOthers = shuffleArray([...others]);
    const wrongOptions = shuffledOthers.slice(0, 3);
    let options = [correct, ...wrongOptions];
    return shuffleArray(options);
}

// ==================== RENDER FUNCTIONS ====================
function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container home-menu">
            <h1 class="title">🇯🇵 NIHONGO QUIZ</h1>
            <p class="subtitle">pilih mode belajar</p>
            <div class="mode-buttons">
                <button class="mode-btn" data-mode="hiragana">🍡 Hiragana</button>
                <button class="mode-btn" data-mode="katakana">🗡️ Katakana</button>
                <button class="mode-btn" data-mode="kotoba">📖 Kotoba</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            loadQuiz(mode);
        });
    });
}

async function loadQuiz(mode) {
    currentMode = mode;
    currentIndex = 0;
    score = 0;
    answered = false;
    
    const app = document.getElementById('app');
    app.innerHTML = `<div class="container loading">⏳ Memuat data ${mode}...</div>`;

    try {
        const response = await fetch(DATA_URLS[mode]);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Data kosong atau format salah');
        }
        
        console.log(`✅ Loaded ${data.length} questions for ${mode}`);
        quizData = data;
        shuffledQuestions = shuffleArray(data);
        renderQuiz();
    } catch (error) {
        console.error('Fetch error:', error);
        app.innerHTML = `
            <div class="container">
                <div class="quiz-card error">
                    <h3>⚠️ Gagal memuat data</h3>
                    <p>Error: ${error.message}</p>
                    <p style="font-size: 0.8rem; margin: 1rem 0;">Pastikan file JSON tersedia di GitHub</p>
                    <button class="next-btn back-btn" id="backHomeBtn">← Kembali</button>
                </div>
            </div>
        `;
        document.getElementById('backHomeBtn')?.addEventListener('click', renderHome);
    }
}

function renderQuiz() {
    if (currentIndex >= shuffledQuestions.length) {
        renderResult();
        return;
    }

    const question = shuffledQuestions[currentIndex];
    currentCorrectAnswer = question.jawaban;
    currentOptions = generateOptions(question, shuffledQuestions);
    
    let optionsHtml = '';
    const letters = ['A', 'B', 'C', 'D'];
    
    currentOptions.forEach((opt, idx) => {
        let statusClass = '';
        if (answered) {
            if (opt === currentCorrectAnswer) statusClass = 'correct';
            else if (selectedAnswer === opt && opt !== currentCorrectAnswer) statusClass = 'wrong';
        }
        optionsHtml += `
            <button class="option-btn ${statusClass}" data-answer="${opt}" ${answered ? 'disabled' : ''}>
                <span class="prefix">${letters[idx]}</span> ${opt}
            </button>
        `;
    });

    let feedbackHtml = '';
    if (answered) {
        const isCorrect = selectedAnswer === currentCorrectAnswer;
        feedbackHtml = `
            <div class="feedback" style="background: ${isCorrect ? '#14532d' : '#7f1d1d'}">
                ${isCorrect ? '✅ Benar!' : `❌ Salah! Jawaban benar: ${currentCorrectAnswer}`}
            </div>
        `;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="quiz-card">
                <div class="quiz-header">
                    <span>📖 ${currentMode.toUpperCase()}</span>
                    <span>🎯 Skor: ${score}</span>
                    <span>📋 ${currentIndex+1}/${shuffledQuestions.length}</span>
                </div>
                <div class="question">${escapeHtml(question.soal)}</div>
                <div class="options" id="optionsContainer">
                    ${optionsHtml}
                </div>
                ${feedbackHtml}
                ${answered ? `<button class="next-btn" id="nextBtn">${currentIndex+1 === shuffledQuestions.length ? '🏁 Selesai' : '→ Soal Berikutnya'}</button>` : ''}
                <button class="next-btn reset-btn" id="resetQuizBtn">🔄 Reset Quiz</button>
                <button class="next-btn back-btn" id="backToHomeBtn">← Ganti Mode</button>
            </div>
        </div>
    `;

    // Event listeners
    if (!answered) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                const answer = btn.getAttribute('data-answer');
                selectedAnswer = answer;
                answered = true;
                
                if (answer === currentCorrectAnswer) {
                    score++;
                }
                renderQuiz();
            });
        });
    }
    
    document.getElementById('resetQuizBtn')?.addEventListener('click', () => {
        shuffledQuestions = shuffleArray(quizData);
        currentIndex = 0;
        score = 0;
        answered = false;
        renderQuiz();
    });
    
    document.getElementById('backToHomeBtn')?.addEventListener('click', renderHome);
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        currentIndex++;
        answered = false;
        renderQuiz();
    });
}

function renderResult() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="quiz-card" style="text-align: center;">
                <h2>✨ Hasil Quiz ${currentMode} ✨</h2>
                <p style="font-size: 2.5rem; margin: 2rem; font-weight: bold;">${score} / ${shuffledQuestions.length}</p>
                <button class="next-btn" id="restartBtn">🔄 Kerjakan Ulang</button>
                <button class="next-btn back-btn" id="homeBtn">← Pilih Mode Lain</button>
            </div>
        </div>
    `;
    document.getElementById('restartBtn')?.addEventListener('click', () => {
        shuffledQuestions = shuffleArray(quizData);
        currentIndex = 0;
        score = 0;
        answered = false;
        renderQuiz();
    });
    document.getElementById('homeBtn')?.addEventListener('click', renderHome);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== START APP ====================
renderHome();
