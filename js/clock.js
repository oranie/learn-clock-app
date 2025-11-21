export class Clock {
    constructor() {
        this.hourHand = document.getElementById('hourHand');
        this.minuteHand = document.getElementById('minuteHand');
        this.hourDisplay = document.getElementById('hourDisplay');
        this.minuteDisplay = document.getElementById('minuteDisplay');
        this.analogClock = document.getElementById('analogClock');

        // Initial time: 9:00
        this.hours = 9;
        this.minutes = 0;

        this.isDragging = false;
        this.activeHand = null;

        this.init();
    }

    init() {
        this.updateDisplay();
        this.addEventListeners();
    }

    updateDisplay() {
        // Calculate degrees
        // Minute hand: 6 degrees per minute
        const minuteDeg = this.minutes * 6;

        // Hour hand: 30 degrees per hour + 0.5 degrees per minute
        const hourDeg = (this.hours % 12) * 30 + this.minutes * 0.5;

        this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
        this.hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

        // Digital Display
        this.hourDisplay.textContent = this.hours;
        this.minuteDisplay.textContent = this.minutes.toString().padStart(2, '0');
    }

    addEventListeners() {
        // Simple click/drag implementation for now. 
        // For a robust "drag to set time" feature, we need to calculate the angle of the mouse relative to the center.

        this.analogClock.addEventListener('mousedown', (e) => this.startDrag(e));
        this.analogClock.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });

        window.addEventListener('mouseup', () => this.endDrag());
        window.addEventListener('touchend', () => this.endDrag());
    }

    startDrag(e) {
        // Determine if we clicked near the clock to start "setting" it
        // For simplicity, clicking anywhere on the clock face allows setting the minute hand (which drives the hour hand)
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

        // Calculate angle in radians, then convert to degrees
        // Math.atan2(y, x) returns angle from x-axis. We want 0 at top (y-axis).
        // So we swap x and y logic slightly or adjust result.
        // Standard atan2 is (y, x). 
        // 0 deg is 3 o'clock. 
        // We want 0 deg at 12 o'clock.

        let angleRad = Math.atan2(deltaY, deltaX);
        let angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to rotate 0 to top

        if (angleDeg < 0) angleDeg += 360;

        // Snap to nearest 5 minutes (30 degrees) for easier usage for kids? 
        // Or keep it smooth. Let's try smooth first, but maybe snap to minutes (6 degrees).
        const snappedDeg = Math.round(angleDeg / 6) * 6;

        // Update time based on angle
        // This is "setting the minute hand directly"
        // We need to handle the "wrapping" of hours if we spin it around.
        // But for a simple version, let's just set the minutes based on position 
        // and keep the hour static unless we implement full rotation tracking.

        // BETTER APPROACH for "Learning":
        // Just calculate the time shown by the angle and set it.
        // But wait, if I drag from 11 to 1, did I go forward or backward?
        // For a simple kids app, let's just set the minute hand to the angle, 
        // and update the hour hand proportionally, but we might lose the "hour" context (AM/PM or 1 vs 13)
        // Since it's a 12h clock, 1-12 is fine.

        // Let's try to just determine "Minutes" from the angle.
        let minutes = Math.round(snappedDeg / 6);
        if (minutes === 60) minutes = 0;

        // If we want to change the hour, we need to detect full rotations.
        // That's complex. 
        // Alternative: Just let them set the minute, and if they want to change hour, maybe we have a separate control?
        // OR: We infer the hour based on where the hour hand WAS?

        // Let's try a simpler interaction for V1:
        // Dragging sets the time. 
        // We need to know "Total Minutes" to handle hours correctly.

        // Let's just set the minutes for now and see how it feels.
        // And maybe allow dragging the hour hand separately?

        // Let's try: Dragging controls the MINUTE hand primarily.
        // We need to track previous angle to know if we crossed the 12 o'clock boundary to increment/decrement hour.

        if (this.lastAngle === undefined) {
            this.lastAngle = angleDeg;
        }

        let diff = angleDeg - this.lastAngle;
        // Handle 359 -> 1 transition
        if (diff < -180) diff += 360;
        if (diff > 180) diff -= 360;

        // Update total minutes
        // 360 degrees = 60 minutes
        // diff degrees = (diff/6) minutes

        // We'll accumulate "fractional minutes" to be smooth
        if (!this.totalMinutes) this.totalMinutes = this.hours * 60 + this.minutes;

        this.totalMinutes += diff / 6;

        // Normalize
        if (this.totalMinutes < 0) this.totalMinutes += 12 * 60; // Wrap around 12h
        if (this.totalMinutes >= 12 * 60) this.totalMinutes -= 12 * 60;

        this.hours = Math.floor(this.totalMinutes / 60);
        if (this.hours === 0) this.hours = 12; // 12-hour clock display
        this.minutes = Math.floor(this.totalMinutes % 60);

        this.lastAngle = angleDeg;
        this.updateDisplay();
    }

    endDrag() {
        this.isDragging = false;
        this.lastAngle = undefined;
        // Snap to nearest minute exactly on release
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
