// import the original type declarations
import "i18next";
// import all namespaces (for the default language, only)
import zh from "../locales/zh.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "ui",
    resources: typeof zh
  }
}