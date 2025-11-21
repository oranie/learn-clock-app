import { Clock } from './clock.js';
import { Quiz } from './quiz.js';

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
