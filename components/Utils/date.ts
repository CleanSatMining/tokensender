export function getFirstDayOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  const firstDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  return firstDay.getTime();
}

export function getLastDayOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth(); // Les mois sont indexés à partir de zéro

  // Utilisation du dernier jour du mois pour obtenir le timestamp à 23h59
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0, 0, 0, 0, 0)); // Le jour 0 du mois suivant donne le dernier jour du mois actuel
  //const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDayOfMonth.getTime();
}
