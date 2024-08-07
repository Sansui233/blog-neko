import i18next from "../locales/i18n";

export function dateToYMDMM(d: Date): string {
  return d.getFullYear() + "-"
    + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
    + ("0" + d.getDate()).slice(-2) + " "
    + ("0" + d.getHours()).slice(-2) + ":"
    + ("0" + d.getMinutes()).slice(-2);
}




export function dateI18n(d: Date, to: "day" | "miniute" = "day", mode: "dateYMD" | "dateMDY" = "dateYMD"): string {
  const t = i18next.t
  const lang = i18next.resolvedLanguage

  function appendOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return day + 'st';
      case 2: return day + 'nd';
      case 3: return day + 'rd';
      default: return day + 'th';
    }
  }

  switch (to) {
    case "day":
      return t(mode, {
        year: d.getFullYear(),
        month: lang !== "en" ? d.getMonth() + 1 : new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
        day: lang !== "en" ? d.getDate() : appendOrdinalSuffix(d.getDate()),
      })
    case "miniute":
      return t(mode, {
        year: d.getFullYear(),
        month: lang !== "en" ? d.getMonth() + 1 : new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
        day: lang !== "en" ? d.getDate() : appendOrdinalSuffix(d.getDate()),
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