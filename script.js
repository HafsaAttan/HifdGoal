function calculate() {
  const minutesPerDay = parseInt(document.getElementById("minutesPerDay").value, 10);
  const daysPerWeek   = parseInt(document.getElementById("daysPerWeek").value, 10);
  const targetJuz     = parseInt(document.getElementById("targetJuz").value, 10);
  const result        = document.getElementById("result");

  if (!minutesPerDay || minutesPerDay <= 0 || !daysPerWeek || daysPerWeek <= 0 || !targetJuz || targetJuz <= 0) {
    result.innerHTML = "<p style='color:#EF4444'>Vul alle velden in met geldige waarden.</p>";
    return;
  }

  // ~10 verses per page, 20 pages per juz, 1 minute per verse on average
  const versesPerJuz  = 10 * 20;
  const totalVerses   = targetJuz * versesPerJuz;
  const minutesPerVerse = 1;
  const totalMinutes  = totalVerses * minutesPerVerse;
  const sessionsNeeded = Math.ceil(totalMinutes / minutesPerDay);
  const totalDays     = Math.ceil(sessionsNeeded / (daysPerWeek / 7));

  const years  = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days   = totalDays % 30;

  let tijdLabel = "";
  if (years > 0)  tijdLabel += `${years} jaar `;
  if (months > 0) tijdLabel += `${months} maanden `;
  if (days > 0)   tijdLabel += `${days} dagen`;
  if (!tijdLabel) tijdLabel = "minder dan een dag";

  result.innerHTML = `
    <p>Bij <strong>${minutesPerDay} min/dag</strong> op <strong>${daysPerWeek} dagen/week</strong>
    duurt het memoriseren van <strong>${targetJuz} juz</strong> ongeveer:</p>
    <p style="font-size:1.4em; font-weight:bold; color:#008080">${tijdLabel.trim()}</p>
  `;
}
