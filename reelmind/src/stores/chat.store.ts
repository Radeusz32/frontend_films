import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ChatAPI } from '@/api/modules/chat.api'
import type { ChatMessage } from '@/types/chat'

function newSessionId(): string {
  return crypto.randomUUID()
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const isOpen = ref(false)
  const sessionId = ref(newSessionId())
  const error = ref<string | null>(null)

  async function send(text: string): Promise<void> {
    messages.value.push({ role: 'user', content: text, timestamp: new Date() })
    loading.value = true
    error.value = null
    try {
      const res = await ChatAPI.send(text, sessionId.value)
      messages.value.push({ role: 'assistant', content: res.reply, timestamp: new Date() })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd połączenia'
      messages.value.push({
        role: 'assistant',
        content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
        timestamp: new Date(),
      })
    } finally {
      loading.value = false
    }
  }

  async function clearHistory(): Promise<void> {
    try {
      await ChatAPI.clearSession(sessionId.value)
    } catch {
      // ignore
    }
    messages.value = []
    sessionId.value = newSessionId()
  }

  function open(): void { isOpen.value = true }
  function close(): void { isOpen.value = false }
  function toggle(): void { isOpen.value = !isOpen.value }

  return { messages, loading, isOpen, error, send, clearHistory, open, close, toggle }
})
