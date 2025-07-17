class PomodoroTimer {
  static FOCUS_END_MESSAGES = [
    "Nice work! Deserve a break, don't you think?",
    "Focus complete! Time to let your neurons stretch.",
    "Brain gains secured. Take five?",
    "Well done! Your brain is sizzling hot. Cool it down?",
    "Mission complete. Shall we commence chilling?",
    "Time's up, champ! Go romanticize your break."
  ];

  static BREAK_END_MESSAGES = [
    "Break over! Back to brain-building!",
    "Alright, genius, let's get back to it.",
    "Fun's over. Time to impress your future self.",
    "C'mon, sexy brain doesn't build itself.",
    "Back to the grind! But, like, the cool kind.",
    "Unleash the productivity beast!"
  ];

  constructor() {
    this.initElements();
    this.initState();
    this.setupEventListeners();
    this.initCircle(); 

    this.resizeObserver = new ResizeObserver(() => {
      this.initCircle();
      this.updateDisplay();
    });
    this.resizeObserver.observe(document.querySelector('.timer-container'));
    
    this.updateDisplay();
  }

  initElements() {
    this.circle = document.querySelector('.progress-ring__circle');
    this.timerText = document.getElementById('timer-text');
    this.startBtn = document.getElementById('start-timer');
    this.stopBtn = document.getElementById('stop-timer');
    this.resetBtn = document.getElementById('reset-timer');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mainNav = document.getElementById('main-nav');
  }

  initCircle() {
    const timerContainer = document.querySelector('.timer-container');
    const containerWidth = parseFloat(getComputedStyle(timerContainer).width);

    this.radius = containerWidth * 0.47;
    this.circumference = 2 * Math.PI * this.radius;

    const center = containerWidth / 2;
    this.circle.setAttribute('r', this.radius);
    this.circle.setAttribute('cx', center);
    this.circle.setAttribute('cy', center);
    this.circle.style.strokeDasharray = this.circumference;
    this.circle.style.strokeDashoffset = this.circumference;

    this.circle.style.strokeWidth = containerWidth * 0.03;
  }

  initState() {
    this.timerDuration = 25 * 60;
    this.timeLeft = this.timerDuration;
    this.interval = null;
    this.running = false;
    this.targetTime = 0;
    this.isRefilling = false;
    this.animationFrameId = null;
    this.isFirstCycle = true;
    this.currentMode = 'focus';
  }

  setupEventListeners() {
    this.timerText.addEventListener('click', () => this.handleTimerClick());
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.stopBtn.addEventListener('click', () => this.stopTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    
    this.mobileMenu.addEventListener('click', () => this.toggleMobileMenu());
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
  }

  startTimer() {
    if (this.isRefilling) return;
    
    if (!this.running) {
      if (this.timeLeft === this.timerDuration) {
        this.isFirstCycle 
          ? this.startFocusCycle(this.timerDuration)
          : this.currentMode === 'focus'
            ? this.startFocusCycle(this.timerDuration)
            : this.startBreakCycle(this.timerDuration);
      } else {
        this.resumeTimer();
      }
    }
  }

  stopTimer() {
    if (this.running) {
      const now = Math.floor(Date.now() / 1000);
      this.timeLeft = Math.max(0, this.targetTime - now);
    }
    this.clearAllTimers();
    this.updateDisplay();
  }

  resetTimer() {
    this.clearAllTimers();
    this.timeLeft = this.timerDuration;
    this.isFirstCycle = true;
    this.currentMode = 'focus';
    this.setProgress(100);
    this.updateDisplay();
  }

  clearAllTimers() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrameId);
    this.interval = null;
    this.animationFrameId = null;
    this.running = false;
    this.isRefilling = false;
  }

  updateDisplay() {
    this.timerText.textContent = this.secondsToMMSS(this.timeLeft);
    this.setProgress((this.timeLeft / this.timerDuration) * 100);
  }

  setProgress(percentRemaining) {
    const offset = this.circumference * (1 - (percentRemaining / 100));
    this.circle.style.strokeDashoffset = offset;
    this.circle.style.stroke = this.currentMode === 'focus' 
      ? 'var(--color-primary)' 
      : 'var(--color-secondary)';
  }

  startFocusCycle(seconds) {
    this.runTimer(seconds, 'var(--color-primary)', 'focus', () => {
      setTimeout(() => {
        const message = this.getRandomMessage(PomodoroTimer.FOCUS_END_MESSAGES);
        if (confirm(message)) {
          this.promptForNewTime("Enter break duration (MM:SS):", "05:00", (breakSeconds) => {
            this.animateRefill(breakSeconds, 'var(--color-secondary)', () => {
              this.startBreakCycle(breakSeconds);
            });
          });
        }
      }, 500);
    });
  }

  startBreakCycle(breakSeconds) {
    this.runTimer(breakSeconds, 'var(--color-secondary)', 'break', () => {
      setTimeout(() => {
        const message = this.getRandomMessage(PomodoroTimer.BREAK_END_MESSAGES);
        if (confirm(message)) {
          this.promptForNewTime("Enter focus duration (MM:SS):", "25:00", (focusSeconds) => {
            this.animateRefill(focusSeconds, 'var(--color-primary)', () => {
              this.startFocusCycle(focusSeconds);
            });
          });
        }
      }, 500);
    });
  }

  runTimer(seconds, color, mode, onComplete) {
    this.clearAllTimers();
    this.currentMode = mode;

    this.timerDuration = seconds;
    this.timeLeft = seconds;
    this.circle.style.stroke = color;
    this.setProgress(100);
    this.updateDisplay();

    setTimeout(() => {
      this.targetTime = Math.floor(Date.now() / 1000) + seconds;
      this.running = true;
      this.interval = setInterval(() => this.checkTimer(onComplete), 1000);
    }, 200);
  }

  checkTimer(onComplete) {
    const now = Math.floor(Date.now() / 1000);
    this.timeLeft = Math.max(0, this.targetTime - now);

    this.setProgress((this.timeLeft / this.timerDuration) * 100);
    this.timerText.textContent = this.secondsToMMSS(this.timeLeft);

    if (this.timeLeft === 0) {
      this.clearAllTimers();
      this.timerText.textContent = '00:00';
      this.setProgress(0);

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    }
  }

  animateRefill(newDuration, finalColor, callback) {
    this.clearAllTimers();
    this.isRefilling = true;

    this.circle.style.strokeDashoffset = this.circumference;
    this.circle.style.stroke = 'var(--color-primary)';

    let startTime = null;
    const duration = 1000;

    const refillStep = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const offset = this.circumference * (1 - progress);
      this.circle.style.strokeDashoffset = offset;

      this.timerText.textContent = ' ';

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(refillStep);
      } else {
        this.isRefilling = false;
        this.circle.style.stroke = finalColor;
        this.timerDuration = newDuration;
        this.timeLeft = newDuration;
        this.updateDisplay();
        if (callback) callback();
      }
    };

    this.animationFrameId = requestAnimationFrame(refillStep);
  }

  handleTimerClick() {
    if (this.running || this.isRefilling) return;

    const currentTimeStr = this.secondsToMMSS(this.timeLeft);
    this.promptForNewTime("Set focus duration (MM:SS):", currentTimeStr, (newDuration) => {
      this.timerDuration = newDuration;
      this.timeLeft = newDuration;
      this.updateDisplay();
    });
  }

  promptForNewTime(message, defaultValue, callback) {
    const input = prompt(message, defaultValue);
    if (input === null) return;

    if (/^(?:[0-5]?\d):(?:[0-5]\d)$/.test(input)) {
      const seconds = this.convertTimeToSeconds(input);
      if (seconds !== null) callback(seconds);
    } else {
      alert("Please enter time in MM:SS format (e.g., 25:00 or 5:30)");
      this.promptForNewTime(message, defaultValue, callback);
    }
  }

  secondsToMMSS(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  convertTimeToSeconds(timeStr) {
    const [mins, secs] = timeStr.split(':').map(Number);
    if (isNaN(mins) || isNaN(secs) || (mins === 0 && secs === 0)) {
      alert("Time must be greater than 00:00.");
      return null;
    }
    return (mins * 60) + secs;
  }

  getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  toggleMobileMenu() {
    this.mainNav.classList.toggle('active');
    const icon = this.mobileMenu.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  }

  closeMobileMenu() {
    if (window.innerWidth <= 768) {
      this.mainNav.classList.remove('active');
      const icon = this.mobileMenu.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  }

  resumeTimer() {
    if (!this.running && !this.isRefilling && this.timeLeft > 0) {
      this.targetTime = Math.floor(Date.now() / 1000) + this.timeLeft;
      this.running = true;
      this.interval = setInterval(() => this.checkTimer(() => {
        if (this.isFirstCycle) {
          this.isFirstCycle = false;
          const message = this.getRandomMessage(PomodoroTimer.FOCUS_END_MESSAGES);
          if (confirm(message)) {
            this.promptForNewTime("Enter break duration (MM:SS):", "05:00", (breakSeconds) => {
              this.animateRefill(breakSeconds, 'var(--color-secondary)', () => {
                this.startBreakCycle(breakSeconds);
              });
            });
          }
        } else {
          this.currentMode === 'focus'
            ? this.startFocusCycle(this.timerDuration)
            : this.startBreakCycle(this.timerDuration);
        }
      }), 1000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PomodoroTimer();
});