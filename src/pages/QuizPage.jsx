import { useEffect, useState } from 'react';
import Quiz from '../components/Quiz';

const DATA_URLS = {
  hiragana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/hiragana.json',
  katakana: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katakana.json',
  kotoba: 'https://raw.githubusercontent.com/juun4/Database/master/nihongo/katabenda.json'
};

export default function QuizPage({ mode }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(DATA_URLS[mode])
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mode]);

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>⏳ loading kuis...</div>;
  if (!data.length) return <div className="container">gagal ambil data</div>;

  return <Quiz data={data} mode={mode} />;
}
