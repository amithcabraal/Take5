import React, { useState, useEffect } from 'react';
import { wordSets } from './data/wordSets';
import { Grid } from './components/Grid';
import { ResultScreen } from './components/ResultScreen';
import { Sparkles } from 'lucide-react';
import { rearrangeGrid } from './utils/gridUtils';

function App() {
  const [currentSetIndex, setCurrentSetIndex] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('set');
    return setId ? wordSets.findIndex(set => set.id === setId) : 0;
  });
  
  const [letters, setLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [solvedIndices, setSolvedIndices] = useState<number[]>([]);
  const [solvedWords, setSolvedWords] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentSet = wordSets[currentSetIndex];

  useEffect(() => {
    // Shuffle the letters of all words
    const allLetters = currentSet.words.join('').split('');
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }
    setLetters(allLetters);
    setSelectedIndices([]);
    setSolvedIndices([]);
    setSolvedWords([]);
    setShowResult(false);
  }, [currentSetIndex]);

  const handleLetterClick = (index: number) => {
    if (solvedIndices.includes(index)) return;
    
    setIsError(false);
    
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
      return;
    }

    if (selectedIndices.length < 5) {
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      if (newSelected.length === 5) {
        const word = newSelected.map(i => letters[i]).join('');
        if (currentSet.words.includes(word)) {
          // Rearrange grid with the new solved word
          const newLetters = rearrangeGrid(letters, solvedWords, word);
          setLetters(newLetters);
          
          // Update solved indices based on new arrangement
          const newSolvedIndices = Array.from(
            { length: (solvedWords.length + 1) * 5 },
            (_, i) => i
          );
          
          setSolvedIndices(newSolvedIndices);
          setSolvedWords([...solvedWords, word]);
          setSelectedIndices([]);

          if (solvedWords.length + 1 === currentSet.words.length) {
            setTimeout(() => setShowResult(true), 1000);
          }
        } else {
          setIsError(true);
          setTimeout(() => {
            setSelectedIndices([]);
            setIsError(false);
          }, 1000);
        }
      }
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?set=${currentSet.id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handlePlayAgain = () => {
    setCurrentSetIndex((currentSetIndex + 1) % wordSets.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-500" />
            Word Connection
          </h1>
          <p className="text-gray-600 mt-2">Find five 5-letter words about: {currentSet.theme}</p>
          <p className="text-sm text-gray-500 mt-1">Set {currentSetIndex + 1} of {wordSets.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <Grid
            letters={letters}
            selectedIndices={selectedIndices}
            solvedIndices={solvedIndices}
            isError={isError}
            onLetterClick={handleLetterClick}
          />
        </div>

        {showResult && (
          <ResultScreen
            theme={currentSet.theme}
            solvedWords={solvedWords}
            onPlayAgain={handlePlayAgain}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  );
}

export default App;