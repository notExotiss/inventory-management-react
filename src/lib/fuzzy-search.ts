function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        )
      }
    }
  }

  return dp[m][n]
}

function similarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLength
}

export function fuzzyMatch(query: string, text: string, threshold: number = 0.6): boolean {
  if (!query || !text) return false
  
  const lowerQuery = query.toLowerCase().trim()
  const lowerText = text.toLowerCase().trim()

  if (lowerText.includes(lowerQuery)) return true

  const queryWords = lowerQuery.split(/\s+/)
  const textWords = lowerText.split(/\s+/)

  const allWordsMatch = queryWords.every(queryWord => {
    if (textWords.some(textWord => textWord.includes(queryWord))) return true
    
    return textWords.some(textWord => {
      const sim = similarity(queryWord, textWord)
      return sim >= threshold
    })
  })

  if (allWordsMatch) return true

  const overallSimilarity = similarity(lowerQuery, lowerText)
  return overallSimilarity >= threshold
}

export function getMatchScore(query: string, text: string): number {
  if (!query || !text) return 0
  
  const lowerQuery = query.toLowerCase().trim()
  const lowerText = text.toLowerCase().trim()

  if (lowerText === lowerQuery) return 100
  if (lowerText.startsWith(lowerQuery)) return 90
  if (lowerText.includes(lowerQuery)) return 80

  const queryWords = lowerQuery.split(/\s+/)
  const textWords = lowerText.split(/\s+/)
  let wordScore = 0
  queryWords.forEach(queryWord => {
    const bestMatch = Math.max(
      ...textWords.map(textWord => {
        if (textWord.includes(queryWord)) return 70
        return similarity(queryWord, textWord) * 50
      })
    )
    wordScore += bestMatch
  })
  wordScore = wordScore / queryWords.length

  const overallSimilarity = similarity(lowerQuery, lowerText) * 40

  return Math.max(wordScore, overallSimilarity)
}
