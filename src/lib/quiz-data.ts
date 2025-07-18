
export async function fetchQuizQuestions(
  category: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<
  Array<{
    question: string
    options: string[]
    correct: number
  }>
> {
  const prompt = `
Generate 5 ${difficulty} level multiple-choice quiz questions on the topic "${category}".
Each question must:
- Be concise and informative
- Have 4 options
- Include the correct option index
Respond with a JSON array of the following structure:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "correct": 2
  },
  ...
]
Only return the raw JSON, no explanation, no markdown.
`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
 {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const data = await response.json()

  // 🧹 Extract text from Gemini response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

  // 🧼 Remove markdown formatting if any
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()

  try {
    const questions = JSON.parse(cleaned)
    return questions
  } catch (error) {
    console.error("Failed to parse quiz data from Gemini:", error)
    throw error
  }
}
