<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat.store'

const chat = useChatStore()
const input = ref('')
const messagesEl = ref<HTMLElement | null>(null)

async function submit() {
  const text = input.value.trim()
  if (!text || chat.loading) return
  input.value = ''
  await chat.send(text)
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

watch(() => chat.messages.length, scrollToBottom)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Bubble -->
    <button
      class="chat-bubble"
      :class="{ 'chat-bubble--open': chat.isOpen }"
      @click="chat.toggle()"
      aria-label="Otwórz czat filmowy"
    >
      <svg v-if="!chat.isOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Window -->
    <Transition name="chat">
      <div v-if="chat.isOpen" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <span class="chat-avatar">🎬</span>
            <div>
              <div class="chat-title">CineBot</div>
              <div class="chat-subtitle">Asystent filmowy ReelMind</div>
            </div>
          </div>
          <button class="chat-clear" @click="chat.clearHistory()" title="Wyczyść historię">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesEl">
          <div v-if="chat.messages.length === 0" class="chat-empty">
            <span>👋</span>
            <p>Cześć! Jestem CineBot. Zapytaj mnie o film, poproś o polecenia lub powiedz w jakim nastroju jesteś — dobiorę coś dla Ciebie!</p>
          </div>

          <div
            v-for="(msg, i) in chat.messages"
            :key="i"
            :class="['chat-msg', `chat-msg--${msg.role}`]"
          >
            <div class="chat-msg-bubble">{{ msg.content }}</div>
          </div>

          <div v-if="chat.loading" class="chat-msg chat-msg--assistant">
            <div class="chat-msg-bubble chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-footer">
          <textarea
            v-model="input"
            class="chat-input"
            placeholder="Napisz wiadomość…"
            rows="1"
            :disabled="chat.loading"
            @keydown="onKeydown"
          />
          <button
            class="chat-send"
            :disabled="!input.trim() || chat.loading"
            @click="submit"
            aria-label="Wyślij"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Bubble ───────────────────────────────────────────────── */
.chat-bubble {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;
}

@media (max-width: 768px) {
  .chat-bubble {
    bottom: calc(68px + env(safe-area-inset-bottom, 0px));
    right: 16px;
    width: 48px;
    height: 48px;
  }
}
.chat-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6);
}
.chat-bubble--open {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* ── Window ───────────────────────────────────────────────── */
.chat-window {
  position: fixed;
  bottom: 96px;
  right: 28px;
  z-index: 9000;
  width: 360px;
  max-height: 560px;
  border-radius: 20px;
  background: rgba(18, 18, 30, 0.96);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .chat-window {
    bottom: calc(124px + env(safe-area-inset-bottom, 0px));
    right: 0;
    left: 0;
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 70vh;
  }
}

@media (max-width: 380px) {
  .chat-window { max-height: 65vh; }
}

/* ── Header ───────────────────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chat-avatar {
  font-size: 22px;
  line-height: 1;
}
.chat-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.chat-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 1px;
}
.chat-clear {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.45);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.chat-clear:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

/* ── Messages ─────────────────────────────────────────────── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 8px;
  color: rgba(255,255,255,0.45);
  font-size: 13px;
  text-align: center;
  line-height: 1.55;
}
.chat-empty span { font-size: 28px; }

.chat-msg { display: flex; }
.chat-msg--user { justify-content: flex-end; }
.chat-msg--assistant { justify-content: flex-start; }

.chat-msg-bubble {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-msg--user .chat-msg-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.chat-msg--assistant .chat-msg-bubble {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
}

/* Typing indicator */
.chat-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
}
.chat-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: bounce 1.2s infinite;
}
.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* ── Footer ───────────────────────────────────────────────── */
.chat-footer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13.5px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 120px;
  overflow-y: auto;
  transition: border-color 0.15s;
}
.chat-input::placeholder { color: rgba(255, 255, 255, 0.3); }
.chat-input:focus { outline: none; border-color: rgba(99, 102, 241, 0.5); }
.chat-input:disabled { opacity: 0.5; }

.chat-send {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.15s;
}
.chat-send:hover:not(:disabled) { transform: scale(1.05); }
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Transition ───────────────────────────────────────────── */
.chat-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-leave-active { transition: all 0.18s ease-in; }
.chat-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.chat-leave-to  { opacity: 0; transform: translateY(12px) scale(0.97); }
</style>
