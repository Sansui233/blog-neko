import { create } from 'zustand';
import i18next from '../locales/i18n';

// Theme
export type ThemeMsg = 'light' | 'dark' | 'system'

interface TAppState {
  theme: ThemeMsg,
  getCookieTheme: () => ThemeMsg,
  setTheme: (theme: ThemeMsg) => void,
  language: string,
  setLanguage: (lang: string) => void,
}

const useAppState = create<TAppState>()((set) => ({
  theme: "system",
  getCookieTheme: () => {
    const themeLS = window.localStorage.getItem('theme')
    return themeLS === null ? 'system' : themeLS as ThemeMsg
  },
  setTheme: (theme) => {
    window.localStorage.setItem('theme', theme)

    set(() => ({ theme }))
  },
  language: "zh",
  setLanguage: (lang) => {
    i18next.changeLanguage(lang)
  },

}))

export default useAppState;