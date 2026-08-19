let currentSpread = 0;
const totalSpreads = 3;
const spreadLabels = ["I - II", "III - IV", "V - VI"];

let audioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let masterGain = null;
let isAudioActive = false;
let veilDisturbed = false;
let presenceTimer = null;

const whispers = [
    "the archive remembers every hand that opens it",
    "you were not the first visitor",
    "something moved between the pages",
    "do not close the archive yet",
    "the seal is warmer than it should be",
    "there is no page seven"
];

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleAmbientDrone() {
    initAudioEngine();
    const btn = document.getElementById("audio-toggle");

    if (!isAudioActive) {
        if (audioCtx.state === "suspended") audioCtx.resume();

        const filter = audioCtx.createBiquadFilter();
        masterGain = audioCtx.createGain();
        droneGain = audioCtx.createGain();

        droneOsc1 = audioCtx.createOscillator();
        droneOsc2 = audioCtx.createOscillator();

        droneOsc1.type = "sawtooth";
        droneOsc1.frequency.setValueAtTime(
            55,
            audioCtx.currentTime
        );

        droneOsc2.type = "sine";
        droneOsc2.frequency.setValueAtTime(
            54.35,
            audioCtx.currentTime
        );

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
            135,
            audioCtx.currentTime
        );
        filter.Q.setValueAtTime(
            1.2,
            audioCtx.currentTime
        );

        droneGain.gain.setValueAtTime(
            0.0001,
            audioCtx.currentTime
        );

        droneGain.gain.exponentialRampToValueAtTime(
            0.055,
            audioCtx.currentTime + 2.8
        );

        masterGain.gain.setValueAtTime(
            0.72,
            audioCtx.currentTime
        );

        droneOsc1.connect(filter);
        droneOsc2.connect(filter);

        filter.connect(droneGain);
        droneGain.connect(masterGain);
        masterGain.connect(audioCtx.destination);

        droneOsc1.start();
        droneOsc2.start();

        isAudioActive = true;

        if (btn) {
            btn.classList.add("active");
            btn.textContent = "🕯 Resonance Bound (Active)";
        }

    } else {

        if (droneGain) {

            droneGain.gain.exponentialRampToValueAtTime(
                0.0001,
                audioCtx.currentTime + 1.2
            );

            setTimeout(() => {

                try {
                    droneOsc1?.stop();
                    droneOsc2?.stop();
                } catch {}

                droneOsc1?.disconnect();
                droneOsc2?.disconnect();
                droneGain?.disconnect();

                isAudioActive = false;

            }, 1250);
        }

        if (btn) {
            btn.classList.remove("active");
            btn.textContent = "🕯 Kindle Ambient Resonance";
        }
    }
}


function playTone(
    freq,
    duration = 0.12,
    type = "sine",
    volume = 0.035
) {
    if (!isAudioActive || !audioCtx) return;

    try {

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;

        osc.frequency.setValueAtTime(
            freq,
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

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();

        osc.stop(
            audioCtx.currentTime + duration
        );

    } catch {}
}


function playPageFlipSound() {

    if (!isAudioActive || !audioCtx) return;

    try {

        const bufferSize =
            Math.floor(audioCtx.sampleRate * 0.18);

        const buffer =
            audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate
            );

        const output =
            buffer.getChannelData(0);

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

        source.buffer = buffer;

        filter.type = "bandpass";

        filter.frequency.setValueAtTime(
            800,
            audioCtx.currentTime
        );

        filter.Q.setValueAtTime(
            1.5,
            audioCtx.currentTime
        );

        gain.gain.setValueAtTime(
            0.045,
            audioCtx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioCtx.currentTime + 0.18
        );

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        source.start();

    } catch {}
}


/* =========================
   PAGE NAVIGATION
========================= */

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
        0.02
    );


    document
        .querySelectorAll(".tome-page-spread")
        .forEach((spread, idx) => {

            spread.classList.toggle(
                "active",
                idx === currentSpread
            );

        });


    document
        .querySelectorAll(".ribbon-btn")
        .forEach((btn, idx) => {

            btn.classList.toggle(
                "active",
                idx === currentSpread
            );

        });


    const indicator =
        document.getElementById("spread-count");

    if (indicator) {
        indicator.textContent =
            spreadLabels[currentSpread];
    }


    /*
        Sometimes the archive whispers
        when a page is turned.
    */

    if (Math.random() < 0.42) {

        showWhisper(
            whispers[
                Math.floor(
                    Math.random() * whispers.length
                )
            ]
        );

    }


    /*
        The final spread is where
        the archive becomes more active.
    */

    if (
        currentSpread === 2 &&
        Math.random() < 0.55
    ) {

        disturbPresence();

    }
}


function nextPage() {

    turnToPage(
        (currentSpread + 1) % totalSpreads
    );

}


function prevPage() {

    turnToPage(
        (currentSpread - 1 + totalSpreads)
        % totalSpreads
    );

}


/* =========================
   WHISPERS
========================= */

function showWhisper(text) {

    const el =
        document.getElementById("whisper-text");

    if (!el) return;

    el.textContent =
        `“${text}”`;

    el.classList.remove("show");

    /*
        Force browser reflow so
        the animation can restart.
    */

    void el.offsetWidth;

    el.classList.add("show");
}


/* =========================
   PRESENCE EFFECT
========================= */

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


/* =========================
   GLITCH EFFECT
========================= */

function glitchArchive() {

    document.body.classList.remove(
        "glitching"
    );

    void document.body.offsetWidth;

    document.body.classList.add(
        "glitching"
    );


    const status =
        document.getElementById("status-text");

    const footer =
        document.getElementById("footer-status");


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
                veilDisturbed
                    ? "the veil is thin"
                    : "something is listening";

        }

    }, 1300);
}


/* =========================
   DISTURB THE VEIL
========================= */

function disturbTheVeil() {

    veilDisturbed =
        !veilDisturbed;


    document.body.classList.toggle(
        "veil-disturbed",
        veilDisturbed
    );


    const btn =
        document.getElementById("veil-toggle");


    if (btn) {

        btn.textContent =
            veilDisturbed
                ? "◈ Veil Disturbed"
                : "◈ Disturb the Veil";


        btn.classList.toggle(
            "active",
            veilDisturbed
        );

    }


    if (veilDisturbed) {

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


/* =========================
   ALTAR / PRESENCE BINDING
========================= */

function bindPresence() {

    const sigil =
        document.getElementById(
            "altar-sigil"
        );

    if (!sigil) return;


    const bind = () => {

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
                "#8d1119";

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


        const count =
            document.getElementById(
                "visitor-count"
            );


        if (count) {

            count.textContent =
                "002";

        }

    };


    sigil.addEventListener(
        "click",
        bind
    );


    sigil.addEventListener(
        "keydown",
        e => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                bind();

            }

        }
    );
}


/* =========================
   SEALED CURIOSITY
========================= */

function bindSealedCuriosity() {

    const card =
        document.getElementById(
            "sealed-curio"
        );

    if (!card) return;


    const reveal = () => {

        card.classList.toggle(
            "revealed"
        );


        const revealed =
            card.classList.contains(
                "revealed"
            );


        const p =
            card.querySelector("p");


        const status =
            card.querySelector(
                ".status-pill"
            );


        if (revealed) {

            if (p) {

                p.textContent =
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

            if (p) {

                p.textContent =
                    "There is an entry here that was not written by you.";

            }


            if (status) {

                status.textContent =
                    "Classification: █████";

            }

        }

    };


    card.addEventListener(
        "click",
        reveal
    );


    card.addEventListener(
        "keydown",
        e => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                reveal();

            }

        }
    );
}


/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        /* =====================
           KEYBOARD NAVIGATION
        ===================== */

        document.addEventListener(
            "keydown",
            e => {

                if (
                    e.key === "ArrowRight"
                ) {

                    nextPage();

                }


                if (
                    e.key === "ArrowLeft"
                ) {

                    prevPage();

                }


                if (
                    e.key.toLowerCase() === "v"
                ) {

                    disturbTheVeil();

                }

            }
        );


        /* =====================
           AUTONOMOUS ARCHIVE
        ===================== */

        presenceTimer =
            setInterval(() => {

                /*
                    Do nothing if the tab isn't visible.
                */

                if (document.hidden) {
                    return;
                }


                /*
                    Small chance that the archive
                    decides to acknowledge the visitor.
                */

                if (
                    Math.random() < 0.18
                ) {

                    showWhisper(
                        whispers[
                            Math.floor(
                                Math.random() *
                                whispers.length
                            )
                        ]
                    );


                    if (
                        Math.random() < 0.25
                    ) {

                        glitchArchive();

                    }

                }

            }, 18000);


        /* =====================
           TOME MOUSE RESPONSE
        ===================== */

        const tome =
            document.getElementById(
                "tome"
            );


        document.addEventListener(
            "pointermove",
            e => {

                if (
                    !tome ||
                    window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches
                ) {

                    return;

                }


                const rect =
                    tome.getBoundingClientRect();


                const x =
                    (
                        (e.clientX - rect.left)
                        / rect.width
                        - 0.5
                    ) * 2;


                const y =
                    (
                        (e.clientY - rect.top)
                        / rect.height
                        - 0.5
                    ) * 2;


                const inside =
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom;


                if (inside) {

                    tome.style.transform =
                        `perspective(1800px)
                         rotateY(${x * 0.7}deg)
                         rotateX(${-y * 0.45}deg)`;

                } else {

                    tome.style.transform =
                        "";

                }

            }
        );


        /* =====================
           CLEANUP
        ===================== */

        window.addEventListener(
            "beforeunload",
            () => {

                clearInterval(
                    presenceTimer
                );

            }
        );

    }
);
