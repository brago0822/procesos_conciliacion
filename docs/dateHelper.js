// 📌 dateHelper.js
// Definir en el "scope" global
window.DateHelper = {

 TIMEZONE: "America/Bogota",

/**
 * Convierte un string "YYYY-MM-DD" en un Date (hora local Bogotá)
 */
parseBogotaDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); 
},

/**
 * Formatea un Date en "DD/MM/YYYY" (local Bogotá)
 */
formatBogotaDate(date, format = "DD/MM/YYYY") {
  const opts = { timeZone: DateHelper.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" };
  const parts = new Intl.DateTimeFormat("es-CO", opts).formatToParts(date);
  
  const day = parts.find(p => p.type === "day").value;
  const month = parts.find(p => p.type === "month").value;
  const year = parts.find(p => p.type === "year").value;

  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
},

/**
 * Compara si dos fechas son el mismo día (ignora hora)
 */
isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
},

/**
 * Suma días a una fecha (manteniendo zona Bogotá)
 */
addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

};