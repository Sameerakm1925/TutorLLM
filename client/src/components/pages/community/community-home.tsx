import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Alert,
} from "@material-tailwind/react";
import {
  MegaphoneIcon,
  PuzzlePieceIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const TECH_WORDS = [
  "REACT", "JAVASCRIPT", "TYPESCRIPT", "TAILWIND", "NODEJS",
  "MONGODB", "EXPRESS", "PYTHON", "DOCKER", "GOLANG"
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "New Course Coming Soon",
    content: "A comprehensive 'Advanced React Patterns' topic will be added to the library in 2 weeks. Stay tuned!",
    date: "May 6, 2024",
    instructor: "John Doe"
  },
  {
    id: 2,
    title: "Live Q&A Session",
    content: "Join us this Friday at 4 PM for a live session on 'Scaling Web Applications'.",
    date: "May 5, 2024",
    instructor: "John Doe"
  }
];

const CommunityHome: React.FC = () => {
  // Game State
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
  const [score, setScore] = useState(0);

  const scramble = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const initGame = () => {
    const word = TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];
    let scrambled = scramble(word);
    while (scrambled === word) {
      scrambled = scramble(word);
    }
    setCurrentWord(word);
    setScrambledWord(scrambled);
    setUserInput("");
    setFeedback({ type: null, message: "" });
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCheck = () => {
    if (userInput.toUpperCase() === currentWord) {
      setFeedback({ type: 'success', message: "Correct! Well done." });
      setScore(score + 10);
      setTimeout(initGame, 1500);
    } else {
      setFeedback({ type: 'error', message: "Try again! That's not quite right." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h2" color="blue-gray" className="mb-2 text-center font-bold" placeholder={undefined}>
          Community Hub
        </Typography>
        <Typography variant="paragraph" className="text-center text-gray-600 mb-10" placeholder={undefined}>
          Keep up with updates and sharpen your mind with our learning breaks.
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Announcements Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MegaphoneIcon className="h-6 w-6 text-blue-600" />
              <Typography variant="h4" color="blue-gray" placeholder={undefined}>
                Announcements
              </Typography>
            </div>
            {ANNOUNCEMENTS.map((ann) => (
              <Card key={ann.id} className="border border-gray-200 shadow-sm" placeholder={undefined}>
                <CardBody className="p-5" placeholder={undefined}>
                  <div className="flex justify-between items-start mb-2">
                    <Typography variant="h6" color="blue-gray" className="font-bold" placeholder={undefined}>
                      {ann.title}
                    </Typography>
                    <span className="text-xs text-gray-400 font-medium">{ann.date}</span>
                  </div>
                  <Typography variant="paragraph" className="text-gray-700 text-sm mb-4" placeholder={undefined}>
                    {ann.content}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-600">{ann.instructor.charAt(0)}</span>
                    </div>
                    <Typography variant="small" className="text-gray-500 font-semibold" placeholder={undefined}>
                      {ann.instructor}
                    </Typography>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Mini-Game Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <PuzzlePieceIcon className="h-6 w-6 text-purple-600" />
              <Typography variant="h4" color="blue-gray" placeholder={undefined}>
                Brain-Break Zone
              </Typography>
            </div>
            <Card className="border border-purple-100 bg-white shadow-md overflow-hidden" placeholder={undefined}>
              <div className="bg-purple-600 py-3 px-5 text-white flex justify-between items-center">
                <Typography variant="small" className="font-bold uppercase tracking-wider" placeholder={undefined}>
                  Word Scramble
                </Typography>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-80 uppercase font-bold">Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
              </div>
              <CardBody className="p-8 text-center" placeholder={undefined}>
                <Typography variant="small" className="text-gray-500 mb-6 font-medium italic" placeholder={undefined}>
                  Unscramble the tech word below:
                </Typography>
                
                <div className="bg-gray-50 py-4 px-6 rounded-xl mb-8 border-2 border-dashed border-gray-200">
                  <Typography variant="h3" className="tracking-[0.5em] text-purple-700 font-mono" placeholder={undefined}>
                    {scrambledWord}
                  </Typography>
                </div>

                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    label="Your Answer"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="text-center font-bold"
                    onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                    crossOrigin={undefined}
                  />
                  
                  {feedback.type && (
                    <Alert
                      color={feedback.type === 'success' ? 'green' : 'red'}
                      className="py-2"
                      icon={feedback.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : undefined}
                    >
                      {feedback.message}
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCheck}
                      className="flex-grow bg-purple-600"
                      placeholder={undefined}
                    >
                      Check
                    </Button>
                    <Button
                      variant="outlined"
                      color="purple"
                      onClick={initGame}
                      className="px-4"
                      placeholder={undefined}
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <Typography variant="small" className="mt-8 text-gray-400 text-[10px] leading-tight" placeholder={undefined}>
                  The community page features a brain-break zone where students can take a short mental break while staying in the learning mindset through tech-themed word puzzles.
                </Typography>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;


