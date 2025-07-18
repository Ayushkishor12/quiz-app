"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award, Trash2 } from "lucide-react"
import { getLeaderboard, clearLeaderboard, type LeaderboardEntry } from "../lib/leaderboard"

interface LeaderboardProps {
  onBack: () => void
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    setScores(getLeaderboard())
  }, [])

  const filteredScores = filter === "all" ? scores : scores.filter((score) => score.category === filter)

  const categories = Array.from(new Set(scores.map((score) => score.category)))

  const handleClearLeaderboard = () => {
    if (confirm("Are you sure you want to clear all scores? This cannot be undone.")) {
      clearLeaderboard()
      setScores([])
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>
        )
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Leaderboard
            </h1>
          </div>
          {scores.length > 0 && (
            <Button variant="destructive" onClick={handleClearLeaderboard} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              onClick={() => setFilter(category)}
              size="sm"
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Leaderboard */}
        {filteredScores.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No scores yet!</h3>
              <p className="text-gray-500">Complete a quiz to see your score on the leaderboard.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredScores.map((entry, index) => (
              <Card
                key={`${entry.name}-${entry.date}`}
                className={`transition-all duration-200 hover:shadow-md ${index < 3 ? "ring-2 ring-yellow-200" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index)}
                      <div>
                        <h3 className="font-semibold text-lg">{entry.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="capitalize">{entry.category}</span>
                          <Badge className={`text-xs ${getDifficultyColor(entry.difficulty)}`}>
                            {entry.difficulty}
                          </Badge>
                          <span>•</span>
                          <span>{Math.floor(entry.time / 1000)}s</span>
                          <span>•</span>
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{entry.score}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {scores.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{scores.length}</div>
                  <div className="text-sm text-gray-600">Total Games</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{Math.max(...scores.map((s) => s.score))}</div>
                  <div className="text-sm text-gray-600">High Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(scores.reduce((acc, s) => acc + s.time, 0) / scores.length / 1000)}s
                  </div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
