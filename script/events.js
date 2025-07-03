document.addEventListener('DOMContentLoaded', function() {
    const daysContainer = document.getElementById('days');
    const monthYear = document.getElementById('month-year');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Montag als erster Wochentag

        monthYear.textContent = `${new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(firstDay)} ${currentYear}`;
        daysContainer.innerHTML = '';

        // Leere Zellen für Tage vor dem 1. des Monats
        for (let i = 0; i < startDay; i++) {
            daysContainer.innerHTML += '<div></div>';
        }

        // Tage des Monats
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            
            // Heutigen Tag markieren
            if (i === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            daysContainer.appendChild(dayElement);
        }
    }

    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();
});