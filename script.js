document.getElementById('memorization-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const minutesPerDay = parseInt(document.getElementById('minutes-per-day').value, 10);
    const linesPerSession = parseInt(document.getElementById('lines-per-session').value, 10);

    const totalLines = 6236; // Gemiddeld aantal regels in de Qur'an
    const daysNeeded = Math.ceil(totalLines / linesPerSession);
    const weeks = Math.floor(daysNeeded / 7);
    const days = daysNeeded % 7;

    document.getElementById('result').innerHTML =
        `Je hebt ongeveer <strong>${weeks} weken en ${days} dagen</strong> nodig om de hele Qur'an te memoriseren.`;
});
function calculateMemorizationTime() {
  // Haal de ingevoerde minuten per dag op
  const minutesPerDay = document.getElementById("minutes").value;

  if (!minutesPerDay || minutesPerDay <= 0) {
    document.getElementById("result").innerText = "Voer een geldig aantal minuten in.";
    return;
  }

  // Totaal aantal versen in de Qur'an
  const totalVerses = 6236;

  // Gemiddeld aantal tijd per vers (bijvoorbeeld 1 minuut per vers)
  const minutesPerVerse = 1; 

  // Bereken de totale tijd om de Qur'an te memoriseren
  const totalMinutesRequired = totalVerses * minutesPerVerse;

  // Bereken het aantal dagen
  const daysRequired = totalMinutesRequired / minutesPerDay;

  // Bereken jaren, maanden en dagen
  const years = Math.floor(daysRequired / 365);
  const months = Math.floor((daysRequired % 365) / 30);
  const days = Math.floor(daysRequired % 30);

  // Toon het resultaat
  document.getElementById("result").innerText = `Het duurt ongeveer ${years} jaar, ${months} maanden en ${days} dagen om de Qur'an te memoriseren.`;
}
