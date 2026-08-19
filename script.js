/*
    GRIMOIRE ARCHIVE ENGINE
    v3

    The archive remembers.
    The archive watches.
*/

let currentSpread = 0;
const totalSpreads = 3;
const spreadLabels = ["I - II", "III - IV", "V - VI"];

let audioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let isAudioActive = false;

const ARCHIVE_KEY = "grimoire_archive_v3";

const whispers = [
    "the archive remembers every hand that opens it",
    "you were not the first visitor",
    "something moved between the pages",
    "do not close the archive yet",
    "the seal is warmer than it should be",
    "there is no page seven",
    "the archive has recorded your presence",
    "some entries are still being written",
    "the workshop is not empty",
    "something is waiting behind the seal"
];

const defaultArchiveState = {
    visits: 0,
    pagesSeen: [],
    discoveries: [],
    veilDisturbed: false,
    presenceBound: false,
    curiosityOpened: false,
    firstVisit: Date.now(),
    lastVisit: Date.now()
};

let archiveState = loadArchiveState();


/* =========================================================
   ARCHIVE MEMORY
========================================================= */

function loadArchiveState() {

    try {

        const saved =
            localStorage.getItem(ARCHIVE_KEY);

        if (!saved) {
            return {
                ...defaultArchiveState
            };
        }

        return {
            ...defaultArchiveState,
            ...JSON.parse(saved)
        };

    } catch {

        return {
            ...defaultArchiveState
        };

    }
}


function saveArchiveState() {

    try {

        localStorage.setItem(
            ARCHIVE_KEY,
            JSON.stringify(archiveState)
        );

    } catch {
        // Storage may be unavailable.
    }
}


function registerVisit() {

    archiveState.visits += 1;
    archiveState.lastVisit = Date.now();

    saveArchiveState();

}


function addDiscovery(id) {

    if (
        archiveState.discoveries.includes(id)
    ) {
        return false;
    }

    archiveState.discoveries.push(id);

    saveArchiveState();

    return true;
}


function hasDiscovery(id) {

    return archiveState.discoveries.includes(id);

}


/* =========================================================
   AUDIO ENGINE
========================================================= */

function initAudioEngine() {

    if (!audioCtx) {

        audioCtx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

}


function toggleAmbientDrone() {

    initAudioEngine();

    const btn =
        document.getElementById(
            "audio-toggle"
        );

    if (!isAudioActive) {

        if (
            audioCtx.state === "suspended"
        ) {

            audioCtx.resume();

        }


        droneOsc1 =
            audioCtx.createOscillator();

        droneOsc2 =
            audioCtx.createOscillator();

        const filter =
            audioCtx.createBiquadFilter();

        droneGain =
            audioCtx.createGain();


        droneOsc1.type =
            "sawtooth";

        droneOsc1.frequency.setValueAtTime(
            55,
            audioCtx.currentTime
        );


        droneOsc2.type =
            "sine";

        droneOsc2.frequency.setValueAtTime(
            54.4,
            audioCtx.currentTime
        );


        filter.type =
            "lowpass";

        filter.frequency.setValueAtTime(
            140,
            audioCtx.currentTime
        );


        droneGain.gain.setValueAtTime(
            0.001,
            audioCtx.currentTime
        );

        droneGain.gain.exponentialRampToValueAtTime(
            0.08,
            audioCtx.currentTime + 2.5
        );


        droneOsc1.connect(filter);
        droneOsc2.connect(filter);

        filter.connect(droneGain);
        droneGain.connect(
            audioCtx.destination
        );


        droneOsc1.start();
        droneOsc2.start();


        isAudioActive = true;


        if (btn) {

            btn.classList.add("active");

            btn.textContent =
                "🕯️ Resonance Bound (Active)";

        }

    } else {

        if (droneGain) {

            droneGain.gain.exponentialRampToValueAtTime(
                0.0001,
                audioCtx.currentTime + 1.2
            );


            setTimeout(() => {

                try {

                    if (droneOsc1) {
                        droneOsc1.stop();
                        droneOsc1.disconnect();
                    }

                    if (droneOsc2) {
                        droneOsc2.stop();
                        droneOsc2.disconnect();
                    }

                } catch {}

                isAudioActive = false;

            }, 1200);

        }


        if (btn) {

            btn.classList.remove(
                "active"
            );

            btn.textContent =
                "🕯️ Kindle Ambient Resonance";

        }

    }

}


/* =========================================================
   SIMPLE SYNTH SOUNDS
========================================================= */

function playTone(
    frequency,
    duration = 0.15,
    type = "sine",
    volume = 0.025
) {

    if (
        !isAudioActive ||
        !audioCtx
    ) {
        return;
    }


    try {

        const oscillator =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();


        oscillator.type =
            type;

        oscillator.frequency.setValueAtTime(
            frequency,
            audioCtx.currentTime
        );


        gain.gain.setValueAtTime(
            volume,
            audioCtx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioCtx.currentTime + duration
        );


        oscillator.connect(gain);
        gain.connect(
            audioCtx.destination
        );


        oscillator.start();

        oscillator.stop(
            audioCtx.currentTime +
            duration
        );

    } catch {}

}


/* =========================================================
   PAGE RUSTLE
========================================================= */

function playPageFlipSound() {

    if (
        !isAudioActive ||
        !audioCtx
    ) {
        return;
    }


    try {

        const bufferSize =
            Math.floor(
                audioCtx.sampleRate *
                0.18
            );


        const noiseBuffer =
            audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate
            );


        const output =
            noiseBuffer.getChannelData(0);


        for (
            let i = 0;
            i < bufferSize;
            i++
        ) {

            output[i] =
                Math.random() * 2 - 1;

        }


        const source =
            audioCtx.createBufferSource();

        const filter =
            audioCtx.createBiquadFilter();

        const gain =
            audioCtx.createGain();


        source.buffer =
            noiseBuffer;


        filter.type =
            "bandpass";

        filter.frequency.setValueAtTime(
            800,
            audioCtx.currentTime
        );

        filter.Q.setValueAtTime(
            1.5,
            audioCtx.currentTime
        );


        gain.gain.setValueAtTime(
            0.04,
            audioCtx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioCtx.currentTime + 0.18
        );


        source.connect(filter);
        filter.connect(gain);
        gain.connect(
            audioCtx.destination
        );


        source.start();

    } catch {}

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function turnToPage(index) {

    if (
        index < 0 ||
        index >= totalSpreads
    ) {
        return;
    }


    currentSpread = index;


    playPageFlipSound();


    playTone(
        110 + index * 22,
        0.16,
        "triangle",
        0.018
    );


    document
        .querySelectorAll(
            ".tome-page-spread"
        )
        .forEach(
            (spread, idx) => {

                spread.classList.toggle(
                    "active",
                    idx === currentSpread
                );

            }
        );


    document
        .querySelectorAll(
            ".ribbon-btn"
        )
        .forEach(
            (btn, idx) => {

                btn.classList.toggle(
                    "active",
                    idx === currentSpread
                );

            }
        );


    const indicator =
        document.getElementById(
            "spread-count"
        );


    if (indicator) {

        indicator.textContent =
            spreadLabels[currentSpread];

    }


    if (
        !archiveState.pagesSeen.includes(
            currentSpread
        )
    ) {

        archiveState.pagesSeen.push(
            currentSpread
        );

        saveArchiveState();

    }


    if (
        Math.random() < 0.38
    ) {

        showWhisper(
            whispers[
                Math.floor(
                    Math.random() *
                    whispers.length
                )
            ]
        );

    }


    /*
        The final spread has a higher
        chance of triggering an event.
    */

    if (
        currentSpread === 2 &&
        Math.random() < 0.5
    ) {

        disturbPresence();

    }

}


function nextPage() {

    if (
        currentSpread <
        totalSpreads - 1
    ) {

        turnToPage(
            currentSpread + 1
        );

    } else {

        turnToPage(0);

    }

}


function prevPage() {

    if (
        currentSpread > 0
    ) {

        turnToPage(
            currentSpread - 1
        );

    } else {

        turnToPage(
            totalSpreads - 1
        );

    }

}


/* =========================================================
   WHISPERS
========================================================= */

function showWhisper(text) {

    const el =
        document.getElementById(
            "whisper-text"
        );


    if (!el) {
        return;
    }


    el.textContent =
        `“${text}”`;


    el.classList.remove(
        "show"
    );


    void el.offsetWidth;


    el.classList.add(
        "show"
    );

}


/* =========================================================
   PRESENCE
========================================================= */

function disturbPresence() {

    document.body.classList.remove(
        "presence-flash"
    );


    void document.body.offsetWidth;


    document.body.classList.add(
        "presence-flash"
    );


    setTimeout(() => {

        document.body.classList.remove(
            "presence-flash"
        );

    }, 1900);

}


/* =========================================================
   GLITCH
========================================================= */

function glitchArchive() {

    document.body.classList.remove(
        "glitching"
    );


    void document.body.offsetWidth;


    document.body.classList.add(
        "glitching"
    );


    const status =
        document.getElementById(
            "status-text"
        );


    const footer =
        document.getElementById(
            "footer-status"
        );


    const originalStatus =
        status?.textContent ||
        "TOME UNSEALED · ARCHIVE ONLINE";


    if (status) {

        status.textContent =
            "TOME OBSERVING · ARCHIVE AWAKE";

    }


    if (footer) {

        footer.textContent =
            "it knows you are here";

    }


    setTimeout(() => {

        if (status) {

            status.textContent =
                originalStatus;

        }


        if (footer) {

            footer.textContent =
                archiveState.veilDisturbed
                    ? "the veil is thin"
                    : "something is listening";

        }

    }, 1300);

}


/* =========================================================
   VEIL
========================================================= */

function disturbTheVeil() {

    archiveState.veilDisturbed =
        !archiveState.veilDisturbed;


    saveArchiveState();


    document.body.classList.toggle(
        "veil-disturbed",
        archiveState.veilDisturbed
    );


    const btn =
        document.getElementById(
            "veil-toggle"
        );


    if (btn) {

        btn.textContent =
            archiveState.veilDisturbed
                ? "◈ Veil Disturbed"
                : "◈ Disturb the Veil";


        btn.classList.toggle(
            "active",
            archiveState.veilDisturbed
        );

    }


    if (
        archiveState.veilDisturbed
    ) {

        addDiscovery(
            "veil"
        );


        showWhisper(
            "you should not have done that"
        );


        glitchArchive();

    } else {

        showWhisper(
            "the veil settles"
        );

    }

}


/* =========================================================
   ALTAR SEAL
========================================================= */

function bindPresence() {

    const sigil =
        document.getElementById(
            "altar-sigil"
        );


    if (!sigil) {
        return;
    }


    /*
        Restore previous state.
    */

    if (
        archiveState.presenceBound
    ) {

        sigil.classList.add(
            "bound"
        );

        const prompt =
            sigil.querySelector(
                ".sigil-prompt"
            );

        if (prompt) {

            prompt.textContent =
                "✦ PRESENCE BOUND · THE ARCHIVE KNOWS YOU ✦";

        }

    }


    const bind = () => {

        archiveState.presenceBound =
            true;


        addDiscovery(
            "presence"
        );


        saveArchiveState();


        sigil.classList.add(
            "bound"
        );


        const prompt =
            sigil.querySelector(
                ".sigil-prompt"
            );


        if (prompt) {

            prompt.textContent =
                "✦ PRESENCE BOUND · THE ARCHIVE KNOWS YOU ✦";

            prompt.style.color =
                "#9e1b1b";

        }


        playTone(
            73.4,
            0.6,
            "sine",
            0.035
        );


        showWhisper(
            "your presence has been recorded"
        );


        disturbPresence();


        updateArchiveLedger();

    };


    sigil.addEventListener(
        "click",
        bind
    );


    sigil.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                bind();

            }

        }
    );

}


/* =========================================================
   SEALED CURIOSITY
========================================================= */

function bindSealedCuriosity() {

    const card =
        document.getElementById(
            "sealed-curio"
        );


    if (!card) {
        return;
    }


    if (
        archiveState.curiosityOpened
    ) {

        card.classList.add(
            "revealed"
        );

    }


    const reveal = () => {

        const revealed =
            card.classList.toggle(
                "revealed"
            );


        archiveState.curiosityOpened =
            revealed;


        if (revealed) {

            addDiscovery(
                "curiosity"
            );

        }


        saveArchiveState();


        const text =
            card.querySelector(
                "p"
            );


        const status =
            card.querySelector(
                ".status-pill"
            );


        if (revealed) {

            if (text) {

                text.textContent =
                    "You found it. It was already open.";

            }


            if (status) {

                status.textContent =
                    "Classification: YOU";

            }


            showWhisper(
                "this entry was waiting for you"
            );


            glitchArchive();

        } else {

            if (text) {

                text.textContent =
                    "There is an entry here that was not written by you.";

            }


            if (status) {

                status.textContent =
                    "Classification: █████";

            }

        }


        updateArchiveLedger();

    };


    card.addEventListener(
        "click",
        reveal
    );


    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                reveal();

            }

        }
    );

}


/* =========================================================
   ARCHIVE LEDGER
========================================================= */

function updateArchiveLedger() {

    const visitCounter =
        document.getElementById(
            "visitor-count"
        );


    if (visitCounter) {

        visitCounter.textContent =
            String(
                archiveState.visits
            ).padStart(3, "0");

    }


    const discoveryCounter =
        document.getElementById(
            "discovery-count"
        );


    if (discoveryCounter) {

        discoveryCounter.textContent =
            String(
                archiveState.discoveries.length
            );

    }


    const releaseCounter =
        document.getElementById(
            "released-count"
        );


    if (releaseCounter) {

        releaseCounter.textContent =
            "001";

    }


    const conceptCounter =
        document.getElementById(
            "concept-count"
        );


    if (conceptCounter) {

        conceptCounter.textContent =
            "001";

    }

}


/* =========================================================
   AUTONOMOUS ARCHIVE
========================================================= */

let presenceTimer = null;


function startArchiveActivity() {

    presenceTimer =
        setInterval(() => {

            if (
                document.hidden
            ) {
                return;
            }


            /*
                The archive occasionally
                acknowledges the visitor.
            */

            if (
                Math.random() < 0.16
            ) {

                showWhisper(
                    whispers[
                        Math.floor(
                            Math.random() *
                            whispers.length
                        )
                    ]
                );

            }


            /*
                Very rare visual disturbance.
            */

            if (
                Math.random() < 0.08
            ) {

                glitchArchive();

            }

        }, 18000);

}


/* =========================================================
   MOUSE RESPONSE
========================================================= */

function bindTomeMotion() {

    const tome =
        document.getElementById(
            "tome"
        );


    if (!tome) {
        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (
        reducedMotion.matches
    ) {
        return;
    }


    document.addEventListener(
        "pointermove",
        event => {

            const rect =
                tome.getBoundingClientRect();


            const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;


            if (!inside) {

                tome.style.transform =
                    "";

                return;

            }


            const x =
                (
                    (event.clientX - rect.left) /
                    rect.width
                    - 0.5
                ) * 2;


            const y =
                (
                    (event.clientY - rect.top) /
                    rect.height
                    - 0.5
                ) * 2;


            tome.style.transform =
                `perspective(1800px)
                 rotateY(${x * 0.7}deg)
                 rotateX(${-y * 0.45}deg)`;

        }
    );

}


/* =========================================================
   CURSOR SIGIL
========================================================= */

function bindCursorSigil() {

    const cursor =
        document.getElementById(
            "cursor-sigil"
        );


    if (!cursor) {
        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (
        reducedMotion.matches
    ) {
        return;
    }


    document.addEventListener(
        "pointermove",
        event => {

            cursor.style.left =
                `${event.clientX}px`;

            cursor.style.top =
                `${event.clientY}px`;

        }
    );

}


/* =========================================================
   KEYBOARD NAVIGATION
========================================================= */

function bindKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "ArrowRight"
            ) {

                nextPage();

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                prevPage();

            }


            if (
                event.key.toLowerCase() ===
                "v"
            ) {

                disturbTheVeil();

            }

        }
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        registerVisit();


        updateArchiveLedger();


        /*
            Restore veil state.
        */

        if (
            archiveState.veilDisturbed
        ) {

            document.body.classList.add(
                "veil-disturbed"
            );


            const veilButton =
                document.getElementById(
                    "veil-toggle"
                );


            if (veilButton) {

                veilButton.textContent =
                    "◈ Veil Disturbed";

                veilButton.classList.add(
                    "active"
                );

            }

        }


        /*
            Audio.
        */

        const audioButton =
            document.getElementById(
                "audio-toggle"
            );


        if (audioButton) {

            audioButton.addEventListener(
                "click",
                toggleAmbientDrone
            );

        }


        /*
            Veil button.
        */

        const veilButton =
            document.getElementById(
                "veil-toggle"
            );


        if (veilButton) {

            veilButton.addEventListener(
                "click",
                disturbTheVeil
            );

        }


        bindPresence();

        bindSealedCuriosity();

        bindKeyboard();

        bindTomeMotion();

        bindCursorSigil();

        startArchiveActivity();


        /*
            First visit message.
        */

        if (
            archiveState.visits === 1
        ) {

            setTimeout(() => {

                showWhisper(
                    "the archive acknowledges your arrival"
                );

            }, 2600);

        } else {

            setTimeout(() => {

                showWhisper(
                    "welcome back, archivist"
                );

            }, 2200);

        }

    }
);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (presenceTimer) {

            clearInterval(
                presenceTimer
            );

        }

    }
);
