"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Home } from "lucide-react"
// ⬇️ Replace static data with dynamic fetch
import { fetchQuizQuestions } from "@/lib/quiz-data"
import { saveScore } from "@/lib/leaderboard"

interface QuizGameProps {
  category: string
  difficulty: "easy" | "medium" | "hard"
  onComplete: () => void
  soundEnabled: boolean
}

interface Question {
  question: string
  options: string[]
  correct: number
}

export default function QuizGame({ category, difficulty, onComplete, soundEnabled }: QuizGameProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameState, setGameState] = useState<"playing" | "answered" | "finished">("playing")
  const [totalTime, setTotalTime] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [playerName, setPlayerName] = useState("")

  // ⬇️ Fetch Gemini-generated questions
  useEffect(() => {
    async function loadQuestions() {
      const fetched = await fetchQuizQuestions(category, difficulty)
      const shuffled = fetched.sort(() => Math.random() - 0.5).slice(0, 10)
      setQuestions(shuffled)
      setStartTime(Date.now())
    }
    loadQuestions()
  }, [category, difficulty])

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleAnswer(-1)
    }
  }, [timeLeft, gameState])

  const playSound = useCallback(
    (type: "correct" | "incorrect" | "complete") => {
      if (!soundEnabled) return
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        if (type === "correct") {
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        } else if (type === "incorrect") {
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1)
        } else {
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.4)
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch {
        console.log("Audio not supported")
      }
    },
    [soundEnabled]
  )

  const handleAnswer = (answerIndex: number) => {
    if (gameState !== "playing") return

    setSelectedAnswer(answerIndex)
    setGameState("answered")

    const isCorrect = answerIndex === questions[currentQuestionIndex].correct
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3)
      const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3
      setScore(score + (10 + timeBonus) * difficultyMultiplier)
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setTimeLeft(30)
        setGameState("playing")
      } else {
        setTotalTime(Date.now() - startTime)
        setGameState("finished")
        playSound("complete")
      }
    }, 1500)
  }

  const handleSaveScore = () => {
    if (playerName.trim()) {
      saveScore({
        name: playerName.trim(),
        score,
        category,
        difficulty,
        time: totalTime,
        date: new Date().toISOString(),
      })
      onComplete()
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{score} points</div>
              <div className="text-sm text-gray-600">
                Category: {category} | Difficulty: {difficulty}
              </div>
              <div className="text-sm text-gray-600">Time: {Math.floor(totalTime / 1000)}s</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium">
                Enter your name for the leaderboard:
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                maxLength={20}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveScore} disabled={!playerName.trim()} className="flex-1">
                Save Score
              </Button>
              <Button variant="outline" onClick={onComplete} className="flex-1 bg-transparent">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary" className="capitalize">
              {category} - {difficulty}
            </Badge>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5" />
              {timeLeft}s
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left transition-all duration-200 "

              if (gameState === "answered") {
                if (index === currentQuestion.correct) {
                  buttonClass += "bg-green-100 border-green-500 text-green-800 "
                } else if (index === selectedAnswer) {
                  buttonClass += "bg-red-100 border-red-500 text-red-800 "
                } else {
                  buttonClass += "opacity-50 "
                }
              } else {
                buttonClass += "hover:bg-blue-50 border-gray-200 "
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState !== "playing"}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {gameState === "answered" && index === currentQuestion.correct && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {gameState === "answered" && index === selectedAnswer && index !== currentQuestion.correct && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Timer Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeLeft > 10 ? "bg-green-500" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
