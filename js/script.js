// Clock Class
class Clock {
    constructor() {
        this.hourHand = document.getElementById('hourHand');
        this.minuteHand = document.getElementById('minuteHand');
        this.hourDisplay = document.getElementById('hourDisplay');
        this.minuteDisplay = document.getElementById('minuteDisplay');
        this.analogClock = document.getElementById('analogClock');
        this.clockFace = document.getElementById('clockFace');

        // Initial time: 9:00
        this.hours = 9;
        this.minutes = 0;

        this.isDragging = false;
        this.activeHand = null;

        this.init();
    }

    init() {
        this.createMarkers();
        this.updateDisplay();
        this.addEventListeners();
    }

    createMarkers() {
        for (let i = 1; i <= 12; i++) {
            const marker = document.createElement('div');
            marker.className = 'marker';
            marker.textContent = i;

            // Calculate position
            // 30 degrees per hour
            // We want 12 at top (0 deg or -90 deg depending on system)
            // Let's use standard CSS rotation logic
            // 12 is at -90deg (if 0 is right) or just use rotate from center

            const angle = i * 30;
            // Position using rotate and translate
            // We rotate the CONTAINER of the number, then rotate the NUMBER back so it's upright

            marker.style.transform = `rotate(${angle}deg) translate(0, -110px) rotate(-${angle}deg)`;

            this.clockFace.appendChild(marker);
        }

        // Optional: Add small ticks for minutes? 
        // User asked for "5分単位の目盛り" which usually means the numbers 1-12 (5, 10, 15 min positions)
        // But maybe they want actual minute ticks?
        // Let's stick to the numbers 1-12 first as they are the primary "5 minute" indicators.
    }

    updateDisplay() {
        const minuteDeg = this.minutes * 6;
        const hourDeg = (this.hours % 12) * 30 + this.minutes * 0.5;

        this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
        this.hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

        this.hourDisplay.textContent = this.hours;
        this.minuteDisplay.textContent = this.minutes.toString().padStart(2, '0');
    }

    addEventListeners() {
        this.analogClock.addEventListener('mousedown', (e) => this.startDrag(e));
        this.analogClock.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });

        window.addEventListener('mouseup', () => this.endDrag());
        window.addEventListener('touchend', () => this.endDrag());
    }

    startDrag(e) {
        this.isDragging = true;
        this.drag(e);
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const rect = this.analogClock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        let angleRad = Math.atan2(deltaY, deltaX);
        let angleDeg = angleRad * (180 / Math.PI) + 90;

        if (angleDeg < 0) angleDeg += 360;

        const snappedDeg = Math.round(angleDeg / 6) * 6;

        let minutes = Math.round(snappedDeg / 6);
        if (minutes === 60) minutes = 0;

        if (this.lastAngle === undefined) {
            this.lastAngle = angleDeg;
        }

        let diff = angleDeg - this.lastAngle;
        if (diff < -180) diff += 360;
        if (diff > 180) diff -= 360;

        if (!this.totalMinutes) this.totalMinutes = this.hours * 60 + this.minutes;

        this.totalMinutes += diff / 6;

        if (this.totalMinutes < 0) this.totalMinutes += 12 * 60;
        if (this.totalMinutes >= 12 * 60) this.totalMinutes -= 12 * 60;

        this.hours = Math.floor(this.totalMinutes / 60);
        if (this.hours === 0) this.hours = 12;
        this.minutes = Math.floor(this.totalMinutes % 60);

        this.lastAngle = angleDeg;
        this.updateDisplay();
    }

    endDrag() {
        this.isDragging = false;
        this.lastAngle = undefined;
        this.minutes = Math.round(this.minutes);
        this.updateDisplay();
    }

    setTime(h, m) {
        this.hours = h;
        this.minutes = m;
        this.totalMinutes = (h === 12 ? 0 : h) * 60 + m;
        this.updateDisplay();
    }
}

// Quiz Class
class Quiz {
    constructor(clock) {
        this.clock = clock;
        this.isActive = false;
        this.container = document.getElementById('quizContainer');
        this.questionEl = document.getElementById('quizQuestion');
        this.optionsEl = document.getElementById('quizOptions');
        this.feedbackEl = document.getElementById('quizFeedback');
        this.digitalDisplay = document.getElementById('digitalDisplay');
        this.scoreEl = document.getElementById('currentScore');
        this.modal = document.getElementById('celebrationModal');
        this.restartBtn = document.getElementById('restartBtn');

        this.score = 0;

        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    toggleMode() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.startQuiz();
            this.container.classList.remove('hidden');
            this.digitalDisplay.classList.add('hidden');
        } else {
            this.container.classList.add('hidden');
            this.digitalDisplay.classList.remove('hidden');
            this.feedbackEl.textContent = '';
            this.resetScore();
        }
    }

    startQuiz() {
        this.resetScore();
        this.nextQuestion();
    }

    resetScore() {
        this.score = 0;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreEl.textContent = this.score;
    }

    resetGame() {
        this.modal.classList.add('hidden');
        this.resetScore();
        this.nextQuestion();
    }

    nextQuestion() {
        this.feedbackEl.textContent = '';
        this.optionsEl.innerHTML = '';

        const h = Math.floor(Math.random() * 12) + 1;
        const m = Math.floor(Math.random() * 12) * 5;

        this.correctTime = { h, m };
        this.clock.setTime(h, m);

        this.questionEl.textContent = 'いまなんじ？';

        const options = [this.correctTime];
        while (options.length < 4) {
            const randH = Math.floor(Math.random() * 12) + 1;
            const randM = Math.floor(Math.random() * 12) * 5;

            const exists = options.some(o => o.h === randH && o.m === randM);
            if (!exists) {
                options.push({ h: randH, m: randM });
            }
        }

        options.sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = `${opt.h}:${opt.m.toString().padStart(2, '0')}`;
            btn.onclick = () => this.checkAnswer(opt);
            this.optionsEl.appendChild(btn);
        });
    }

    checkAnswer(selected) {
        if (selected.h === this.correctTime.h && selected.m === this.correctTime.m) {
            this.feedbackEl.textContent = 'せいかい！すごいね！🎉';
            this.feedbackEl.className = 'quiz-feedback correct';

            this.score++;
            this.updateScoreDisplay();

            if (this.score >= 10) {
                setTimeout(() => this.showCelebration(), 1000);
            } else {
                setTimeout(() => this.nextQuestion(), 2000);
            }
        } else {
            this.feedbackEl.textContent = 'ざんねん...もういちど！';
            this.feedbackEl.className = 'quiz-feedback incorrect';
        }
    }

    showCelebration() {
        // Confetti effect could be added here if we had a library, 
        // but for now the modal is the celebration.
        this.modal.classList.remove('hidden');
    }
}

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    const clock = new Clock();
    const quiz = new Quiz(clock);

    const modeToggleBtn = document.getElementById('modeToggleBtn');

    modeToggleBtn.addEventListener('click', () => {
        quiz.toggleMode();
        if (quiz.isActive) {
            modeToggleBtn.textContent = 'とけいであそぶ';
            modeToggleBtn.classList.remove('primary');
            modeToggleBtn.style.backgroundColor = 'var(--accent-color)';
        } else {
            modeToggleBtn.textContent = 'クイズモード';
            modeToggleBtn.classList.add('primary');
            modeToggleBtn.style.backgroundColor = '';
        }
    });
});
