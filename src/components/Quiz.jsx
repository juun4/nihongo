import { useState, useEffect } from 'react';
import { shuffleArray, generateOptions } from '../utils/shuffle';

export default function Quiz({ data, mode }) {
  const [shuffledData, setShuffledData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState('');

  // acak soal pertama kali
  useEffect(() => {
    setShuffledData(shuffleArray(data));
  }, [data]);

  // setiap pindah soal, generate opsi ABC
  useEffect(() => {
    if (shuffledData.length === 0) return;
    const current = shuffledData[currentIndex];
    setCorrectAnswer(current.jawaban);
    const newOptions = generateOptions(current, shuffledData);
    setOptions(newOptions);
    setAnswered(false);
    setSelectedOption(null);
    setFeedback('');
  }, [currentIndex, shuffledData]);

  const handleAnswer = (pilihan) => {
    if (answered) return;
    const isCorrect = pilihan === correctAnswer;
    setSelectedOption(pilihan);
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`✅ Benar! ${shuffledData[currentIndex].soal} = ${correctAnswer}`);
    } else {
      setFeedback(`❌ Salah! Jawaban benar adalah ${correctAnswer}`);
    }
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < shuffledData.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFeedback(`🎉 Selesai! Skor akhir: ${score}/${shuffledData.length} 🎉`);
      setAnswered(true); 
    }
  };

  const resetQuiz = () => {
    setShuffledData(shuffleArray(data));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setFeedback('');
  };

  if (shuffledData.length === 0) return <div className="container">Memuat...</div>;

  const currentSoal = shuffledData[currentIndex];
  const isFinished = currentIndex >= shuffledData.length;

  if (isFinished) {
    return (
      <div className="container">
        <div className="quiz-card" style={{ textAlign: 'center' }}>
          <h2>✨ Hasil Quiz {mode} ✨</h2>
          <p style={{ fontSize: '2rem', margin: '2rem' }}>{score} / {shuffledData.length}</p>
          <button className="next-btn reset-btn" onClick={resetQuiz}>🔄 Kerjakan Ulang</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="quiz-card">
        <div className="progress">
          <span>📖 {mode.toUpperCase()}</span>
          <span className="skor">🎯 Skor: {score}</span>
          <span>📋 {currentIndex+1}/{shuffledData.length}</span>
        </div>
        <div className="huruf-soal">{currentSoal.soal}</div>
        
        <div className="opsi-grid">
          {options.map((opt, idx) => {
            let letter = '';
            if (idx === 0) letter = 'A';
            else if (idx === 1) letter = 'B';
            else if (idx === 2) letter = 'C';
            else letter = 'D';
            
            let statusClass = '';
            if (answered && opt === correctAnswer) statusClass = 'benar';
            else if (answered && selectedOption === opt && opt !== correctAnswer) statusClass = 'salah';
            
            return (
              <button
                key={idx}
                className={`opsi-btn ${statusClass}`}
                onClick={() => handleAnswer(opt)}
                disabled={answered}
              >
                <span className="prefix">{letter}</span> {opt}
              </button>
            );
          })}
        </div>

        {feedback && <div className="feedback" style={{ background: feedback.includes('Benar') ? '#14532d' : '#7f1d1d' }}>{feedback}</div>}
        
        {answered && currentIndex + 1 <= shuffledData.length && (
          <button className="next-btn" onClick={nextQuestion}>
            {currentIndex + 1 === shuffledData.length ? '🏁 Selesai' : '→ Soal Berikutnya'}
          </button>
        )}
        <button className="next-btn reset-btn" onClick={resetQuiz}>🔄 Reset Quiz</button>
      </div>
    </div>
  );
            }
