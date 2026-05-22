import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nihongo/hiragana" element={<QuizPage mode="hiragana" />} />
        <Route path="/nihongo/katakana" element={<QuizPage mode="katakana" />} />
        <Route path="/nihongo/kotoba" element={<QuizPage mode="kotoba" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
