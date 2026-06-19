export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  reply: string
  sessionId: string
}
