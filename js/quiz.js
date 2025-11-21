export class Quiz {
    constructor(clock) {
        this.clock = clock;
        this.isActive = false;
        this.container = document.getElementById('quizContainer');
        this.questionEl = document.getElementById('quizQuestion');
        this.optionsEl = document.getElementById('quizOptions');
        this.feedbackEl = document.getElementById('quizFeedback');
        this.digitalDisplay = document.getElementById('digitalDisplay');
    }

    toggleMode() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.startQuiz();
            this.container.classList.remove('hidden');
            this.digitalDisplay.classList.add('hidden'); // Hide answer
        } else {
            this.container.classList.add('hidden');
            this.digitalDisplay.classList.remove('hidden');
            this.feedbackEl.textContent = '';
        }
    }

    startQuiz() {
        this.nextQuestion();
    }

    nextQuestion() {
        this.feedbackEl.textContent = '';
        this.optionsEl.innerHTML = '';

        // Generate random time
        const h = Math.floor(Math.random() * 12) + 1;
        const m = Math.floor(Math.random() * 12) * 5; // 5 minute intervals for easier reading

        this.correctTime = { h, m };
        this.clock.setTime(h, m);

        this.questionEl.textContent = 'いまなんじ？';

        // Generate options
        const options = [this.correctTime];
        while (options.length < 4) {
            const randH = Math.floor(Math.random() * 12) + 1;
            const randM = Math.floor(Math.random() * 12) * 5;

            // Avoid duplicates
            const exists = options.some(o => o.h === randH && o.m === randM);
            if (!exists) {
                options.push({ h: randH, m: randM });
            }
        }

        // Shuffle options
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
            setTimeout(() => this.nextQuestion(), 2000);
        } else {
            this.feedbackEl.textContent = 'ざんねん...もういちど！';
            this.feedbackEl.className = 'quiz-feedback incorrect';
        }
    }
}
