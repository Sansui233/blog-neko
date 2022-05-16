import { EventEmitter } from 'events';

/* Manage App State with event emitter and LocalStorage */

export const emitter = new EventEmitter();

// Theme
export const ThemeEvtName = 'theme changed'
export type ThemeMsg = 'light' | 'dark'
export type ThemeCallBack = (theme: ThemeMsg) => void

/**
 * 修改 localStorage 同时 emit ThemeEvent
 * @param theme 
 * @returns 
 */
export function setAppTheme(theme: ThemeMsg): boolean {
  if (emitter.emit(ThemeEvtName, theme)) {
    window.localStorage.setItem('theme', theme)
    return true
  } else {
    return false
  }
}


/**
 * get theme filed from local storage
 * @returns 'dark' or 'light'
 */
export function getAppTheme(): ThemeMsg {
  return window.localStorage.getItem('theme') as ThemeMsg;
}