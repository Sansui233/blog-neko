export function dateToYMDMM(d: Date): string {
  return d.getFullYear() + "-"
    + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
    + ("0" + d.getDate()).slice(-2) + " "
    + ("0" + d.getHours()).slice(-2) + ":"
    + ("0" + d.getMinutes()).slice(-2);
}

import i18next from "../locales/i18n";

export function dateI18n(d: Date, to: "day" | "miniute" = "day"): string {
  const t = i18next.t
  switch (to) {
    case "day":
      return t('dateYMD', {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      })
    case "miniute":
      return t('dateYMD', {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes()
      })
  }
}

// todo test cases "2021-01-01 00:00"
// "year-month-day" is required
export function parseDate(str: string | Date): Date {
  if (str instanceof Date) {
    return str
  }
  let date = new Date(str)
  if (date.toString() !== "Invalid Date") {
    return date
  } else {
    const newstr = str.slice(0, 11) + "23:59:59" // fallback
    let date = new Date(newstr)
    if (date.toString() !== "Invalid Date") {
      return date
    } else {
      console.error(`[date.ts] error: unable to parse date string "${newstr}"\n\tset date to -1`)
      return new Date(-1)
    }
  }
}