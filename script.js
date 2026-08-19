let currentSpread = 0;
const totalSpreads = 3;
const spreadLabels = ["I - II", "III - IV", "V - VI"];

function turnToPage(index) {
    if (index < 0 || index >= totalSpreads) return;

    currentSpread = index;

    // Update spread visibility
    document.querySelectorAll('.tome-page-spread').forEach((spread, idx) => {
        if (idx === currentSpread) {
            spread.classList.add('active');
        } else {
            spread.classList.remove('active');
        }
    });

    // Update Ribbon button states
    document.querySelectorAll('.ribbon-btn').forEach((btn, idx) => {
        if (idx === currentSpread) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update indicator
    const indicator = document.getElementById('spread-count');
    if (indicator) indicator.textContent = spreadLabels[currentSpread];
}

function nextPage() {
    if (currentSpread < totalSpreads - 1) {
        turnToPage(currentSpread + 1);
    } else {
        turnToPage(0); // Loop back to start
    }
}

function prevPage() {
    if (currentSpread > 0) {
        turnToPage(currentSpread - 1);
    } else {
        turnToPage(totalSpreads - 1);
    }
}

// Altar Sigil Click Reaction
document.addEventListener('DOMContentLoaded', () => {
    const sigil = document.getElementById('altar-sigil');
    if (sigil) {
        sigil.addEventListener('click', () => {
            sigil.style.borderColor = '#9e1b1b';
            sigil.style.boxShadow = '0 0 20px rgba(158, 27, 27, 0.4)';
            const prompt = sigil.querySelector('.sigil-prompt');
            if (prompt) {
                prompt.textContent = "✦ PRESENCE BOUND IN BLOOD & FREQUENCY ✦";
                prompt.style.color = '#9e1b1b';
            }
        });
    }

    // Keyboard Arrow navigation for turns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
    });
});
