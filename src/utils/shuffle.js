export function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateOptions(soalSaatIni, semuaData) {
  // ambil 3 jawaban random berbeda dari data lain + jawaban benar
  const jawabanBenar = soalSaatIni.jawaban;
  const otherAnswers = semuaData
    .filter(item => item.jawaban !== jawabanBenar)
    .map(item => item.jawaban);
  const shuffledOthers = shuffleArray([...otherAnswers]);
  const optionWrong = shuffledOthers.slice(0, 3);
  let options = [jawabanBenar, ...optionWrong];
  return shuffleArray(options);
}
