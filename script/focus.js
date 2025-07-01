"use strict";

window.addEventListener("DOMContentLoaded", () => {
    const circle = document.querySelector('.progress-ring__circle');
    const timerText = document.getElementById('timer-text');
    const start = document.getElementById('start-timer');
    const stop = document.getElementById('stop-timer');
    const reset = document.getElementById('reset-timer');

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius + 1;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    let timerDuration = 25 * 60; // Default 25 minutes
    let timeLeft = timerDuration;
    let interval = null;
    let running = false;
    let targetTime = 0;
    let isRefilling = false;
    let animationFrameId = null;

    timerText.addEventListener('click', () => {
        if (running || isRefilling) return;

        const currentTimeStr = secondsToMMSS(timeLeft);
        const newTimeStr = promptForTime("Set focus duration (MM:SS):", currentTimeStr);
        if (newTimeStr !== null) {
            const newDuration = convertTimeToSeconds(newTimeStr);
            if (newDuration !== null) {
                timerDuration = newDuration;
                timeLeft = timerDuration;
                updateDisplay();
            }
        }
    });

    function secondsToMMSS(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function convertTimeToSeconds(timeStr) {
        const [mins, secs] = timeStr.split(':').map(Number);
        if (isNaN(mins) || isNaN(secs) || (mins === 0 && secs === 0)) {
            alert("Time must be greater than 00:00.");
            return null;
        }
        return (mins * 60) + secs;
    }

    function promptForTime(message, defaultValue) {
        while (true) {
            const input = prompt(message, defaultValue);
            if (input === null) return null;

            if (/^(?:[0-5]?\d):(?:[0-5]\d)$/.test(input)) {
                return input;
            }
            alert("Please enter time in MM:SS format (e.g., 25:00 or 5:30)");
        }
    }

    function setProgress(percentRemaining) {
        const offset = circumference * (1 - (percentRemaining / 100));
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = percentRemaining >= 50 ? 'green' :
                              percentRemaining >= 20 ? 'yellow' : 'red';
    }

    function updateDisplay() {
        timerText.textContent = secondsToMMSS(timeLeft);
        setProgress((timeLeft / timerDuration) * 100);
    }

    function checkTimer(onComplete) {
    const now = Math.floor(Date.now() / 1000);
    timeLeft = Math.max(0, targetTime - now);

    const percentRemaining = (timeLeft / timerDuration) * 100;
    setProgress(percentRemaining);
    timerText.textContent = secondsToMMSS(timeLeft);

    if (timeLeft === 0) {
        clearInterval(interval); // stop interval immediately
        running = false;
        timerText.textContent = '00:00';
        setProgress(0);

        // Wait exactly 1 second after reaching zero before calling onComplete
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 1000);
    }
}

    function animateRefill(newDuration, finalColor, callback) {
        isRefilling = true;
        running = false;
        clearInterval(interval);
        cancelAnimationFrame(animationFrameId);

        circle.style.strokeDashoffset = circumference;
        circle.style.stroke = 'blue';

        let startTime = null;
        const duration = 1000; // 1 second

        function refillStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const offset = circumference * (1 - progress);
            circle.style.strokeDashoffset = offset;

            const displayTime = Math.floor(newDuration * progress);
            timerText.textContent = secondsToMMSS(displayTime);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(refillStep);
            } else {
                isRefilling = false;
                circle.style.stroke = finalColor;
                timerDuration = newDuration;
                timeLeft = newDuration;
                updateDisplay();
                if (callback) callback();
            }
        }

        animationFrameId = requestAnimationFrame(refillStep);
    }

    function startFocusCycle(initialSeconds) {
        runTimer(initialSeconds, 'green', () => {
            setTimeout(() => {
                if (confirm("Focus session done! Ready for break?")) {
                    const breakTimeStr = promptForTime("Enter break duration (MM:SS):", "05:00");
                    if (breakTimeStr) {
                        const breakSeconds = convertTimeToSeconds(breakTimeStr);
                        if (breakSeconds !== null) {
                            animateRefill(breakSeconds, 'blue', () => {
                                startBreakCycle(breakSeconds);
                            });
                        }
                    }
                }
            }, 500);
        });
    }

    function startBreakCycle(breakSeconds) {
        runTimer(breakSeconds, 'blue', () => {
            setTimeout(() => {
                if (confirm("Break over! Ready to focus?")) {
                    const focusTimeStr = promptForTime("Enter focus duration (MM:SS):", "25:00");
                    if (focusTimeStr) {
                        const focusSeconds = convertTimeToSeconds(focusTimeStr);
                        if (focusSeconds !== null) {
                            animateRefill(focusSeconds, 'green', () => {
                                startFocusCycle(focusSeconds);
                            });
                        }
                    }
                }
            }, 500);
        });
    }

    function runTimer(seconds, color, onComplete) {
        cancelAnimationFrame(animationFrameId);
        clearInterval(interval);

        timerDuration = seconds;
        timeLeft = seconds;
        circle.style.stroke = color;
        setProgress(100);
        updateDisplay();

        setTimeout(() => {
            targetTime = Math.floor(Date.now() / 1000) + seconds + 1;
            running = true;
            interval = setInterval(() => checkTimer(onComplete), 500);
        }, 200);
    }

    function stopTimer() {
        running = false;
        clearInterval(interval);
        cancelAnimationFrame(animationFrameId);
        timeLeft = Math.max(0, targetTime - Math.floor(Date.now() / 1000));
        updateDisplay();
    }

    function resetTimer() {
        stopTimer();
        timeLeft = timerDuration;
        setProgress(100);
        updateDisplay();
    }

    updateDisplay();

    start.addEventListener('click', () => {
        if (!running && !isRefilling) {
            startFocusCycle(timerDuration);
        }
    });

    stop.addEventListener('click', stopTimer);
    reset.addEventListener('click', resetTimer);
});
