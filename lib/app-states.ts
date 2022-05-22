import { EventEmitter } from 'events';

/* Manage App State with event emitter and LocalStorage */

export const emitter = new EventEmitter();

// Theme
export const THEME_EVT_NAME = 'theme changed'
export type ThemeMsg = 'light' | 'dark' | 'system'
export type ThemeCallBack = (theme: ThemeMsg) => void

/**
 * 修改 localStorage 同时 emit ThemeEvent
 * @param theme 
 * @returns 
 */
export function setAppTheme(theme: ThemeMsg): boolean {
  if (emitter.emit(THEME_EVT_NAME, theme)) {
    window.localStorage.setItem('theme', theme)
    return true
  } else {
    return false
  }
}


/**
 * Get theme field from local storage
 * @returns 'dark' 'light' or 'system'
 */
export function getAppTheme(): ThemeMsg {
  return window.localStorage.getItem('theme') as ThemeMsg;
}