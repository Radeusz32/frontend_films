import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SupportedLocale } from '@/i18n'

export function useLocale() {
  const { locale } = useI18n()

  const currentLocale = computed(() => locale.value as SupportedLocale)

  function toggleLocale(): void {
    locale.value = locale.value === 'pl' ? 'en' : 'pl'
    localStorage.setItem('reelmind_locale', locale.value)
  }

  function setLocale(lang: SupportedLocale): void {
    locale.value = lang
    localStorage.setItem('reelmind_locale', lang)
  }

  return { currentLocale, toggleLocale, setLocale }
}
