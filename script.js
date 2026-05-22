// ==================== KONFIGURASI ====================
const DATA_URLS = {
    hiragana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/hiragana.json',
    katakana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katakana.json',
    katabenda: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katabenda.json',
    kanjin5: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/kanjin5.json'
};

const SOAL_PER_SESI = 20;
const POIN_PER_SOAL = 5;

let currentMode = null;
let currentSubMode = null;
let fullData = [];
let sessionQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let selectedAnswer = null;
let currentOptions = [];
let currentCorrectAnswer = null;
let currentOptionsLocked = [];

// ==================== UTILS ====================
function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function getRandomItems(arr, count) {
    const shuffled = shuffleArray([...arr]);
    return shuffled.slice(0, count);
}

// ==================== RENDER HOME ====================
function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <h1 class="home-title">🇯🇵 NIHONGO QUIZ</h1>
            <p class="home-sub">pilih mode belajar</p>
            
            <div class="mode-row">
                <div class="mode-card" data-mode="hiragana">
                    <div class="mode-icon">🍡</div>
                    <div class="mode-title">Hiragana</div>
                    <div class="mode-desc">Tebak romaji dari huruf Hiragana</div>
                </div>
                <div class="mode-card" data-mode="katakana">
                    <div class="mode-icon">🗡️</div>
                    <div class="mode-title">Katakana</div>
                    <div class="mode-desc">Tebak romaji dari huruf Katakana</div>
                </div>
            </div>
            
            <div class="mode-row">
                <div class="mode-card" data-mode="katabenda">
                    <div class="mode-icon">📚</div>
                    <div class="mode-title">Kotoba Kata Benda</div>
                    <div class="mode-desc">Kosakata bahasa Jepang</div>
                    <div class="kotoba-menu" id="katabendaMenu">
                        <button class="kotoba-sub-btn" data-sub="arti">🇮🇩 Tebak Arti</button>
                        <button class="kotoba-sub-btn" data-sub="baca">🔊 Tebak Cara Baca</button>
                        <button class="kotoba-sub-btn" data-sub="jepang">🇯🇵 Tebak Jepang</button>
                    </div>
                </div>
                <div class="mode-card" data-mode="kanjin5">
                    <div class="mode-icon">🈳</div>
                    <div class="mode-title">Kanji N5</div>
                    <div class="mode-desc">Belajar Kanji dasar</div>
                    <div class="kotoba-menu" id="kanjin5Menu">
                        <button class="kotoba-sub-btn" data-sub="arti">🇮🇩 Tebak Arti</button>
                        <button class="kotoba-sub-btn" data-sub="baca">🔊 Tebak Bacaan</button>
                        <button class="kotoba-sub-btn" data-sub="jepang">🇯🇵 Tebak Kanji</button>
                    </div>
                </div>
            </div>
            
            <!-- SIMPLE FOOTER -->
            <div class="simple-footer">
                <p>© 2025 <a href="https://www.juun4.cloud" target="_blank">Nihongo Quiz</a> | Created by <a href="https://www.juun4.cloud" target="_blank">Juun4</a></p>
            </div>
        </div>
    `;

    // Floating WhatsApp button (ditaruh di luar container biar fixed)
    const floatContainer = document.getElementById('floatWaContainer');
    if (floatContainer) {
        floatContainer.innerHTML = `
            <div class="float-wa">
                <a href="https://wa.me/6285727631507?text=Halo%2C%20saya%20mau%20request%20soal%20bahasa%20Jepang" 
                   class="whatsapp-float" 
                   target="_blank">
                   💬 Request Soal
                </a>
            </div>
        `;
    }

    // Event listeners
    document.querySelectorAll('.mode-card[data-mode]').forEach(card => {
        const mode = card.getAttribute('data-mode');
        if (mode === 'katabenda' || mode === 'kanjin5') return;
        card.addEventListener('click', () => {
            startQuiz(mode, null);
        });
    });

    document.querySelectorAll('#katabendaMenu .kotoba-sub-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            startQuiz('katabenda', btn.getAttribute('data-sub'));
        });
    });

    document.querySelectorAll('#kanjin5Menu .kotoba-sub-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            startQuiz('kanjin5', btn.getAttribute('data-sub'));
        });
    });
}

// ==================== START QUIZ ====================
async function startQuiz(mode, subMode) {
    // Sembunyikan floating button selama quiz
    const floatContainer = document.getElementById('floatWaContainer');
    if (floatContainer) floatContainer.innerHTML = '';
    
    currentMode = mode;
    currentSubMode = subMode;
    currentIndex = 0;
    score = 0;
    answered = false;
    currentOptionsLocked = [];
    
    const app = document.getElementById('app');
    app.innerHTML = `<div class="container loading">⏳ Memuat data ${mode}...</div>`;
    
    try {
        const response = await fetch(DATA_URLS[mode]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) throw new Error('Data kosong');
        
        fullData = data;
        sessionQuestions = getRandomItems(fullData, SOAL_PER_SESI);
        renderQuiz();
    } catch (error) {
        console.error(error);
        app.innerHTML = `
            <div class="container">
                <div class="quiz-container" style="text-align:center">
                    <h3 style="color:#f87171">⚠️ Gagal memuat data</h3>
                    <p>${error.message}</p>
                    <button class="next-btn back-home" id="backHome">← Kembali</button>
                </div>
            </div>
        `;
        document.getElementById('backHome')?.addEventListener('click', () => {
            renderHome();
        });
    }
}

// ==================== GENERATE OPTIONS ====================
function generateOptionsForQuestion(question, allData, mode, subMode) {
    let correctAnswer;
    let allPossibleAnswers = [];
    
    if (mode === 'hiragana' || mode === 'katakana') {
        correctAnswer = question.jawaban;
        allPossibleAnswers = allData.map(q => q.jawaban);
    } 
    else if (mode === 'katabenda') {
        if (subMode === 'arti') {
            correctAnswer = question.arti;
            allPossibleAnswers = allData.map(q => q.arti);
        } else if (subMode === 'baca') {
            correctAnswer = question.cara_baca;
            allPossibleAnswers = allData.map(q => q.cara_baca);
        } else {
            correctAnswer = question.soal;
            allPossibleAnswers = allData.map(q => q.soal);
        }
    }
    else if (mode === 'kanjin5') {
        if (subMode === 'arti') {
            correctAnswer = question.indonesiago;
            allPossibleAnswers = allData.map(q => q.indonesiago);
        } else if (subMode === 'baca') {
            correctAnswer = question.nihongo;
            allPossibleAnswers = allData.map(q => q.nihongo);
        } else {
            correctAnswer = question.soal;
            allPossibleAnswers = allData.map(q => q.soal);
        }
    }
    
    const uniqueOthers = [...new Set(allPossibleAnswers.filter(a => a !== correctAnswer))];
    const shuffledOthers = shuffleArray(uniqueOthers);
    const wrongOptions = shuffledOthers.slice(0, 3);
    let options = [correctAnswer, ...wrongOptions];
    return shuffleArray(options);
}

function getQuestionText(question, mode, subMode) {
    if (mode === 'hiragana' || mode === 'katakana') {
        return { main: question.soal, sub: 'Tebak romaji:' };
    }
    else if (mode === 'katabenda') {
        if (subMode === 'arti') {
            return { main: question.soal, sub: 'Arti dalam Bahasa Indonesia?' };
        } else if (subMode === 'baca') {
            return { main: question.soal, sub: 'Cara baca (romaji)?' };
        } else {
            return { main: question.arti, sub: 'Bahasa Jepangnya?' };
        }
    }
    else if (mode === 'kanjin5') {
        if (subMode === 'arti') {
            return { main: question.soal, sub: 'Arti dalam Bahasa Indonesia?' };
        } else if (subMode === 'baca') {
            return { main: question.soal, sub: 'Bacaan (nihongo)?' };
        } else {
            return { main: question.indonesiago, sub: 'Kanji Jepangnya?' };
        }
    }
    return { main: '?', sub: '' };
}

function getCorrectAnswerValue(question, mode, subMode) {
    if (mode === 'hiragana' || mode === 'katakana') return question.jawaban;
    if (mode === 'katabenda') {
        if (subMode === 'arti') return question.arti;
        if (subMode === 'baca') return question.cara_baca;
        return question.soal;
    }
    if (mode === 'kanjin5') {
        if (subMode === 'arti') return question.indonesiago;
        if (subMode === 'baca') return question.nihongo;
        return question.soal;
    }
    return '';
}

function getModeDisplayName(mode, subMode) {
    if (mode === 'hiragana') return 'HIRAGANA';
    if (mode === 'katakana') return 'KATAKANA';
    if (mode === 'katabenda') {
        if (subMode === 'arti') return 'KOTOBENDA · Tebak Arti';
        if (subMode === 'baca') return 'KOTOBENDA · Tebak Baca';
        return 'KOTOBENDA · Tebak Jepang';
    }
    if (mode === 'kanjin5') {
        if (subMode === 'arti') return 'KANJI N5 · Tebak Arti';
        if (subMode === 'baca') return 'KANJI N5 · Tebak Baca';
        return 'KANJI N5 · Tebak Kanji';
    }
    return mode.toUpperCase();
}

// ==================== RENDER QUIZ ====================
function renderQuiz() {
    if (currentIndex >= sessionQuestions.length) {
        renderResult();
        return;
    }
    
    const question = sessionQuestions[currentIndex];
    currentCorrectAnswer = getCorrectAnswerValue(question, currentMode, currentSubMode);
    
    if (currentOptionsLocked[currentIndex]) {
        currentOptions = currentOptionsLocked[currentIndex];
    } else {
        currentOptions = generateOptionsForQuestion(question, fullData, currentMode, currentSubMode);
        currentOptionsLocked[currentIndex] = [...currentOptions];
    }
    
    const { main, sub } = getQuestionText(question, currentMode, currentSubMode);
    
    let optionsHtml = '';
    const letters = ['A', 'B', 'C', 'D'];
    
    currentOptions.forEach((opt, idx) => {
        let statusClass = '';
        if (answered) {
            if (opt === currentCorrectAnswer) statusClass = 'correct';
            else if (selectedAnswer === opt && opt !== currentCorrectAnswer) statusClass = 'wrong';
        }
        optionsHtml += `
            <button class="option-btn ${statusClass}" data-answer="${escapeHtml(opt)}" ${answered ? 'disabled' : ''}>
                <span class="option-prefix">${letters[idx]}</span>
                <span>${escapeHtml(opt)}</span>
            </button>
        `;
    });
    
    let feedbackHtml = '';
    if (answered) {
        const isCorrect = selectedAnswer === currentCorrectAnswer;
        feedbackHtml = `
            <div class="feedback" style="background: ${isCorrect ? '#14532d' : '#7f1d1d'}">
                ${isCorrect ? `✅ Benar! +${POIN_PER_SOAL} poin` : `❌ Salah! Jawaban benar: ${escapeHtml(currentCorrectAnswer)}`}
            </div>
        `;
    }
    
    const currentScore = score;
    const maxScore = sessionQuestions.length * POIN_PER_SOAL;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="quiz-container">
                <div class="quiz-header">
                    <span class="badge-mode">${getModeDisplayName(currentMode, currentSubMode)}</span>
                    <span>🎯 ${currentScore}/${maxScore}</span>
                    <span>📋 ${currentIndex+1}/${sessionQuestions.length}</span>
                </div>
                <div class="question-box">
                    <div class="question-jp">${escapeHtml(main)}</div>
                    <div class="question-sub">${sub}</div>
                </div>
                <div class="options" id="optionsContainer">
                    ${optionsHtml}
                </div>
                ${feedbackHtml}
                ${answered ? `<button class="next-btn" id="nextBtn">${currentIndex+1 === sessionQuestions.length ? '🏁 Lihat Hasil' : '→ Soal Berikutnya'}</button>` : ''}
                <button class="next-btn secondary-btn" id="resetQuizBtn">🔄 Reset Quiz (Soal Baru)</button>
                <button class="next-btn back-home" id="backHomeBtn">← Ganti Mode</button>
            </div>
        </div>
    `;
    
    if (!answered) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                const answer = btn.getAttribute('data-answer');
                selectedAnswer = answer;
                answered = true;
                
                if (answer === currentCorrectAnswer) {
                    score += POIN_PER_SOAL;
                }
                renderQuiz();
            });
        });
    }
    
    document.getElementById('resetQuizBtn')?.addEventListener('click', () => {
        sessionQuestions = getRandomItems(fullData, SOAL_PER_SESI);
        currentIndex = 0;
        score = 0;
        answered = false;
        currentOptionsLocked = [];
        renderQuiz();
    });
    
    document.getElementById('backHomeBtn')?.addEventListener('click', () => {
        renderHome();
    });
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        currentIndex++;
        answered = false;
        renderQuiz();
    });
}

function renderResult() {
    const maxScore = sessionQuestions.length * POIN_PER_SOAL;
    const percentage = (score / maxScore) * 100;
    let message = '';
    if (percentage >= 80) message = '🎉 Hebat! Penguasaanmu luar biasa!';
    else if (percentage >= 60) message = '👍 Bagus! Terus belajar ya!';
    else if (percentage >= 40) message = '📚 Lumayan, tapi perlu lebih banyak latihan.';
    else message = '💪 Jangan menyerah! Coba lagi!';
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="quiz-container result-box">
                <h2>✨ Hasil Quiz ✨</h2>
                <div class="result-score">${score} / ${maxScore}</div>
                <p style="font-size:1.2rem">${Math.round(percentage)}%</p>
                <p style="margin:16px 0">${message}</p>
                <div class="btn-group">
                    <button class="next-btn" id="retryBtn">🔄 Coba Lagi (Soal Baru)</button>
                    <button class="next-btn secondary-btn" id="homeBtn">← Pilih Mode Lain</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('retryBtn')?.addEventListener('click', () => {
        sessionQuestions = getRandomItems(fullData, SOAL_PER_SESI);
        currentIndex = 0;
        score = 0;
        answered = false;
        currentOptionsLocked = [];
        renderQuiz();
    });
    document.getElementById('homeBtn')?.addEventListener('click', () => {
        renderHome();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== START ====================
renderHome();
