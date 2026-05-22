import { Link } from 'react-router-dom';
import '../index.css';

export default function Home() {
  return (
    <div className="container">
      <h1 className="title-glow">🇯🇵 NIHONGO QUIZ</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.7 }}>pilih mode belajar</p>
      <div className="nav-home">
        <Link to="/nihongo/hiragana" className="btn-mode">🍡 Hiragana</Link>
        <Link to="/nihongo/katakana" className="btn-mode">🗡️ Katakana</Link>
        <Link to="/nihongo/kotoba" className="btn-mode">📖 Kotoba</Link>
      </div>
    </div>
  );
}
