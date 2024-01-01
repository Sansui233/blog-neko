import i18next, { default as i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import jp from "./ja.json";
import zh from "./zh.json";

export const resources = {
  "en": en,
  "zh": zh,
  "ja": jp
} as const;

i18n.use(initReactI18next).init({
  lng: "zh",
  ns: ["ui"],
  fallbackLng: 'en',
  resources
});

export default i18next;