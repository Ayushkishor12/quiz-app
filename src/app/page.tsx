"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Play, BarChart3, Settings } from "lucide-react"
import QuizGame from "@/components/quiz-game"
import Leaderboard from "@/components/leaderboard"

export default function QuizApp() {
  const [currentView, setCurrentView] = useState<"home" | "quiz" | "leaderboard">("home")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    const savedSoundPref = localStorage.getItem("quizSoundEnabled")
    if (savedSoundPref !== null) {
      setSoundEnabled(JSON.parse(savedSoundPref))
    }
  }, [])

  const categories = ["coding", "science", "history", "geography", "sports", "entertainment"]

  const startQuiz = (category: string, difficulty: "easy" | "medium" | "hard") => {
    setSelectedCategory(category)
    setSelectedDifficulty(difficulty)
    setCurrentView("quiz")
  }

  const handleQuizComplete = () => {
    setCurrentView("home")
  }

  const toggleSound = () => {
    const newSoundState = !soundEnabled
    setSoundEnabled(newSoundState)
    localStorage.setItem("quizSoundEnabled", JSON.stringify(newSoundState))
  }

  if (currentView === "quiz") {
    return (
      <QuizGame
        category={selectedCategory}
        difficulty={selectedDifficulty}
        onComplete={handleQuizComplete}
        soundEnabled={soundEnabled}
      />
    )
  }

  if (currentView === "leaderboard") {
    return <Leaderboard onBack={() => setCurrentView("home")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Trophy className="text-yellow-500" />
            Quiz Master
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Test your knowledge and climb the leaderboard!</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button variant="outline" onClick={() => setCurrentView("leaderboard")} className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Leaderboard
          </Button>
          <Button variant="outline" onClick={toggleSound} className="flex items-center gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Sound: {soundEnabled ? "On" : "Off"}
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  {category === "coding" && "💻"}
                  {category === "science" && "🔬"}
                  {category === "history" && "📚"}
                  {category === "geography" && "🌍"}
                  {category === "sports" && "⚽"}
                  {category === "entertainment" && "🎬"}
                  {category}
                </CardTitle>
                <CardDescription>3 difficulties available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((difficulty) => (
                    <Button
                      key={difficulty}
                      onClick={() => startQuiz(category, difficulty)}
                      className={`capitalize ${
                        difficulty === "easy"
                          ? "bg-green-500 hover:bg-green-600"
                          : difficulty === "medium"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>Choose a category and difficulty to start your quiz adventure!</p>
        </div>
      </div>
    </div>
  )
}
