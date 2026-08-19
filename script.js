let currentSpread = 0;
const totalSpreads = 3;
const spreadLabels = ["I - II", "III - IV", "V - VI"];

// ================= SYNTHETIC AUDIO ENGINE (WEB AUDIO API) =================
let audioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let isAudioActive = false;

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleAmbientDrone() {
    initAudioEngine();
    const btn = document.getElementById('audio-toggle');

    if (!isAudioActive) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Sub-bass dark foundation (55Hz / A1)
        droneOsc1 = audioCtx.createOscillator();
        droneOsc2 = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        droneGain = audioCtx.createGain();

        droneOsc1.type = 'sawtooth';
        droneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime); // 55Hz Low A

        droneOsc2.type = 'sine';
        droneOsc2.frequency.setValueAtTime(54.4, audioCtx.currentTime); // Slight detune for eerie binaural pulse

        // Dark lowpass filter to remove harshness
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, audioCtx.currentTime);

        // Smooth fade-in
        droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        droneGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 2.5);

        droneOsc1.connect(filter);
        droneOsc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(audioCtx.destination);

        droneOsc1.start();
        droneOsc2.start();

        isAudioActive = true;
        if (btn) {
            btn.classList.add('active');
            btn.textContent = "🕯️ Resonance Bound (Active)";
        }
    } else {
        // Fade out
        if (droneGain) {
            droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
            setTimeout(() => {
                if (droneOsc1) { droneOsc1.stop(); droneOsc1.disconnect(); }
                if (droneOsc2) { droneOsc2.stop(); droneOsc2.disconnect(); }
                isAudioActive = false;
            }, 1200);
        }
        if (btn) {
            btn.classList.remove('active');
            btn.textContent = "🕯️ Kindle Ambient Resonance";
        }
    }
}

// Synthesized Parchment Page Rustle
function playPageFlipSound() {
    if (!isAudioActive || !audioCtx) return;

    try {
        const bufferSize = audioCtx.sampleRate * 0.18;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, audioCtx.currentTime);
        filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        whiteNoise.start();
    } catch (e) {
        // Fallback silently if audio context is blocked
    }
}

// ================= PAGE TURN LOGIC =================
function turnToPage(index) {
    if (index < 0 || index >= totalSpreads) return;

    currentSpread = index;
    playPageFlipSound();

    // Update spread visibility
    document.querySelectorAll('.tome-page-spread').forEach((spread, idx) => {
        if (idx === currentSpread) {
            spread.classList.add('active');
        } else {
            spread.classList.remove('active');
        }
    });

    // Update Ribbon buttons
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
        turnToPage(0);
    }
}

function prevPage() {
    if (currentSpread > 0) {
        turnToPage(currentSpread - 1);
    } else {
        turnToPage(totalSpreads - 1);
    }
}

// ================= DOM INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    // Bind Audio Button
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', toggleAmbientDrone);
    }

    // Altar Sigil Click Reaction
    const sigil = document.getElementById('altar-sigil');
    if (sigil) {
        sigil.addEventListener('click', () => {
            sigil.style.borderColor = '#9e1b1b';
            sigil.style.boxShadow = '0 0 25px rgba(158, 27, 27, 0.6)';
            const prompt = sigil.querySelector('.sigil-prompt');
            if (prompt) {
                prompt.textContent = "✦ PRESENCE BOUND IN BLOOD & FREQUENCY ✦";
                prompt.style.color = '#9e1b1b';
            }
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
    });
});
