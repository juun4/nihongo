import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';

function App() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('📱 App component mounted, current path:', window.location.pathname);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Something went wrong</h2>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  try {
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
  } catch (err) {
    console.error('Router error:', err);
    setHasError(true);
    return null;
  }
}

export default App;
