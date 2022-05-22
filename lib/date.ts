export function dateToString(d: Date){
  return d.getFullYear() + "-"
  + ("0"+(d.getMonth()+1)).slice(-2) + "-"
  + ( "0" + d.getDate()).slice(-2)  + " "
  + ("0" + d.getHours()).slice(-2) + ":" 
  + ("0" + d.getMinutes()).slice(-2);
}

export function dateToYMD(d: Date){
  return d.getFullYear() + "-"
  + ("0"+(d.getMonth()+1)).slice(-2) + "-"
  + ( "0" + d.getDate()).slice(-2);
}