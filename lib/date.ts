import i18next from "../locales/i18n";

export function dateToYMDMM(d: Date): string {
  return d.getFullYear() + "-"
    + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
    + ("0" + d.getDate()).slice(-2) + " "
    + ("0" + d.getHours()).slice(-2) + ":"
    + ("0" + d.getMinutes()).slice(-2);
}




export function dateI18n(d: Date, mode: "dateYMD" | "dateNatural" = "dateNatural"): string {
  const t = i18next.t
  const lang = i18next.resolvedLanguage

  function getEngOrdinalSuffix(day: number) {
    // From https://community.shopify.com/c/Shopify-Design/Ordinal-Number-in-javascript-1st-2nd-3rd-4th/m-p/72156
    const s = ["th", "st", "nd", "rd"],
      v = day % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
  }

  if (mode !== "dateNatural" || lang !== 'en') {
    return t(mode, {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes()
    })
  } else {
    return t(mode, {
      year: d.getFullYear(),
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
      day: d.getDate(),
      daySuffix: getEngOrdinalSuffix(d.getDate()),
      hour: d.getHours(),
      minute: d.getMinutes(),
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