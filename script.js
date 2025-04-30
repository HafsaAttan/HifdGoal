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
