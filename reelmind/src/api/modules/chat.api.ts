import { http } from '@/api/client'
import type { ChatResponse } from '@/types/chat'

export const ChatAPI = {
  send(message: string, sessionId: string): Promise<ChatResponse> {
    return http.post<ChatResponse>('/chat', { message, sessionId })
  },

  clearSession(sessionId: string): Promise<void> {
    return http.delete<void>(`/chat/${sessionId}`)
  },
}
