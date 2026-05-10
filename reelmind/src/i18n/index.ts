import { createI18n } from 'vue-i18n'
import pl from './pl'
import en from './en'



const essa = ' xDD';
const browserLang = navigator.language.startsWith('pl') ? 'pl' : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: browserLang,
  fallbackLocale: 'en',
  messages: { pl, en },
})

export type SupportedLocale = 'pl' | 'en'
