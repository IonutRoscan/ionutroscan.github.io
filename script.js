/* ================================================================
   THE ARCHIVE — GRIMOIRE ENGINE v4
   ================================================================ */

let currentSpread = 0;
const totalSpreads = 3;
const spreadLabels = ["I - II", "III - IV", "V - VI"];

let audioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let masterGain = null;
let isAudioActive = false;
let presenceTimer = null;
let whisperTimer = null;
let toastTimer = null;
let candleTimer = null;
let veilDisturbed = false;

const ARCHIVE_KEY = "roscan_grimoire_archive_v4";
const MAX_CORRUPTION = 100;

const artifacts = [
    {
        id: "001",
        name: "Clank Lorebook Importer",
        status: "OPERATIONAL",
        released: true,
        description: "A Chromium / Brave browser extension for importing lorebook entries into Clank.world.",
        action: "invoke"
    },
    {
        id: "002",
        name: "The JSON Cleansing Engine",
        status: "CONCEPT",
        released: false,
        description: "A planned utility for cleaning, structuring, and validating malformed JSON payloads.",
        action: "sealed"
    }
];

const whispers = [
    "the archive is quiet",
    "you were not the first visitor",
    "the seal remembers",
    "there is no page seven",
    "some ideas arrive before they are built",
    "do not mistake the unfinished for the empty",
    "the archive has recorded your presence",
    "something moved between the pages",
    "the workshop is listening",
    "corruption is not always damage"
];

const defaultState = {
    visits: 0,
    discoveries: [],
    bound: false,
    veil: false,
    conceptOpened: false,
    spread: 0,
    corruption: 0,
    candleEnergy: 100
};

let archiveState = loadArchiveState();

function loadArchiveState() {
    try {
        return {
            ...defaultState,
            ...JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "{}")
        };
    } catch {
        return { ...defaultState };
    }
}

function saveArchiveState() {
    try {
        localStorage.setItem(
            ARCHIVE_KEY,
            JSON.stringify(archiveState)
        );
    } catch {}
}

function discover(id, message) {
    if (!archiveState.discoveries.includes(id)) {
        archiveState.discoveries.push(id);
        saveArchiveState();
        updateArchiveMeta();

        if (message) {
            showToast(message);
        }
    }
}

function hasDiscovery(id) {
    return archiveState.discoveries.includes(id);
}

function addCorruption(amount, message) {
    archiveState.corruption = Math.min(
        MAX_CORRUPTION,
        Math.max(
            0,
            archiveState.corruption + amount
        )
    );

    saveArchiveState();
    updateArchiveCondition();

    if (message) {
        showToast(message);
    }

    if (archiveState.corruption >= 35) {
        document.body.classList.add(
            "corruption-high"
        );
    }

    if (archiveState.corruption >= 70) {
        document.body.classList.add(
            "corruption-critical"
        );
    }
}

function reduceCorruption(amount) {
    archiveState.corruption = Math.max(
        0,
        archiveState.corruption - amount
    );

    saveArchiveState();
    updateArchiveCondition();

    if (archiveState.corruption < 35) {
        document.body.classList.remove(
            "corruption-high"
        );
    }

    if (archiveState.corruption < 70) {
        document.body.classList.remove(
            "corruption-critical"
        );
    }
}

function updateArchiveMeta() {
    const visit =
        document.getElementById(
            "visit-count"
        );

    const discoveries =
        document.getElementById(
            "discovery-count"
        );

    const released =
        document.getElementById(
            "released-count"
        );

    const concepts =
        document.getElementById(
            "concept-count"
        );

    const sealed =
        document.getElementById(
            "sealed-count"
        );

    if (visit) {
        visit.textContent =
            String(
                archiveState.visits
            ).padStart(3, "0");
    }

    if (discoveries) {
        discoveries.textContent =
            String(
                archiveState.discoveries.length
            ).padStart(3, "0");
    }

    if (released) {
        released.textContent =
            String(
                artifacts.filter(
                    a => a.released
                ).length
            ).padStart(3, "0");
    }

    if (concepts) {
        concepts.textContent =
            String(
                artifacts.filter(
                    a => a.status === "CONCEPT"
                ).length
            ).padStart(3, "0");
    }

    if (sealed) {
        sealed.textContent = "000";
    }
}

function updateArchiveCondition() {
    const corruption =
        archiveState.corruption;

    const integrity =
        100 - corruption;

    const integrityValue =
        document.getElementById(
            "integrity-value"
        );

    const corruptionValue =
        document.getElementById(
            "corruption-value"
        );

    const integrityFill =
        document.getElementById(
            "integrity-fill"
        );

    const corruptionFill =
        document.getElementById(
            "corruption-fill"
        );

    const conditionLabel =
        document.getElementById(
            "condition-label"
        );

    const conditionNote =
        document.getElementById(
            "condition-note"
        );

    if (integrityValue) {
        integrityValue.textContent =
            `${integrity}%`;
    }

    if (corruptionValue) {
        corruptionValue.textContent =
            `${corruption}%`;
    }

    if (integrityFill) {
        integrityFill.style.width =
            `${integrity}%`;
    }

    if (corruptionFill) {
        corruptionFill.style.width =
            `${corruption}%`;
    }

    let label = "STABLE";
    let note =
        "No structural anomalies detected.";

    if (corruption >= 15) {
        label = "UNEASY";
        note =
            "Minor irregularities have entered the record.";
    }

    if (corruption >= 35) {
        label = "UNSTABLE";
        note =
            "The archive is responding to repeated interference.";
    }

    if (corruption >= 70) {
        label = "CRITICAL";
        note =
            "Do not assume every message belongs to the author.";
    }

    if (corruption >= 90) {
        label = "COMPROMISED";
        note =
            "The archive is no longer certain which side of the screen it occupies.";
    }

    if (conditionLabel) {
        conditionLabel.textContent =
            label;
    }

    if (conditionNote) {
        conditionNote.textContent =
            note;
    }
}

function showToast(
    message,
    duration = 3200
) {
    const toast =
        document.getElementById(
            "archive-toast"
        );

    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(
        () => {
            toast.classList.remove(
                "show"
            );
        },
        duration
    );
}

function showWhisper(text) {
    const el =
        document.getElementById(
            "whisper-text"
        );

    const line =
        document.querySelector(
            ".whisper-line"
        );

    if (!el || !line) return;

    el.textContent =
        `“${text}”`;

    line.classList.remove(
        "active"
    );

    void line.offsetWidth;

    line.classList.add(
        "active"
    );

    clearTimeout(
        whisperTimer
    );

    whisperTimer =
        setTimeout(
            () => {
                line.classList.remove(
                    "active"
                );
            },
            2200
        );
}

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
            audioCtx.state ===
            "suspended"
        ) {
            audioCtx.resume();
        }

        const filter =
            audioCtx.createBiquadFilter();

        masterGain =
            audioCtx.createGain();

        droneGain =
            audioCtx.createGain();

        droneOsc1 =
            audioCtx.createOscillator();

        droneOsc2 =
            audioCtx.createOscillator();

        droneOsc1.type =
            "sawtooth";

        droneOsc1.frequency.setValueAtTime(
            55,
            audioCtx.currentTime
        );

        droneOsc2.type =
            "sine";

        droneOsc2.frequency.setValueAtTime(
            54.35,
            audioCtx.currentTime
        );

        filter.type =
            "lowpass";

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

        masterGain.connect(
            audioCtx.destination
        );

        droneOsc1.start();
        droneOsc2.start();

        isAudioActive = true;

        if (btn) {
            btn.classList.add("active");

            btn.textContent =
                "🕯 Resonance Bound (Active)";
        }

        discover(
            "audio",
            "RESONANCE ACTIVE · the archive can now hear you"
        );

        addCorruption(2);

    } else {

        if (droneGain) {

            droneGain.gain.exponentialRampToValueAtTime(
                0.0001,
                audioCtx.currentTime + 1.2
            );

            setTimeout(
                () => {

                    try {
                        droneOsc1?.stop();
                    } catch {}

                    try {
                        droneOsc2?.stop();
                    } catch {}

                    droneOsc1?.disconnect();
                    droneOsc2?.disconnect();
                    droneGain?.disconnect();

                    isAudioActive = false;

                },
                1250
            );
        }

        if (btn) {

            btn.classList.remove(
                "active"
            );

            btn.textContent =
                "🕯 Kindle Ambient Resonance";

        }
    }
}

function playTone(
    freq,
    duration = 0.12,
    type = "sine",
    volume = 0.035
) {
    if (
        !isAudioActive ||
        !audioCtx
    ) {
        return;
    }

    try {

        const osc =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();

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

        gain.connect(
            audioCtx.destination
        );

        osc.start();

        osc.stop(
            audioCtx.currentTime +
            duration
        );

    } catch {}
}

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

        source.buffer =
            buffer;

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
            0.045,
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

function turnToPage(index) {

    if (
        index < 0 ||
        index >= totalSpreads
    ) {
        return;
    }

    currentSpread = index;

    archiveState.spread =
        index;

    saveArchiveState();

    playPageFlipSound();

    playTone(
        110 + index * 22,
        0.16,
        "triangle",
        0.02
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

    if (index === 1) {
        discover(
            "artifact",
            "ARTIFACT 001 · operational record opened"
        );
    }

    if (index === 2) {
        discover(
            "worktable",
            "WORKTABLE ACCESSED · concepts are not artifacts"
        );
    }

    addCorruption(
        index === 1
            ? 1
            : 0.5
    );

    if (
        Math.random() < 0.35
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
}

function nextPage() {
    turnToPage(
        (currentSpread + 1) %
        totalSpreads
    );
}

function prevPage() {
    turnToPage(
        (currentSpread - 1 +
            totalSpreads) %
        totalSpreads
    );
}

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

    const oldStatus =
        status?.textContent ||
        "TOME UNSEALED · ARCHIVE ONLINE";

    const oldFooter =
        footer?.textContent ||
        "THE ARCHIVE REMAINS OPEN TO THOSE WHO SEEK · IONUȚ ROȘCAN";

    if (status) {
        status.textContent =
            "TOME OBSERVING · ARCHIVE AWAKE";
    }

    if (footer) {
        footer.textContent =
            "it knows you are here";
    }

    setTimeout(
        () => {

            if (status) {
                status.textContent =
                    oldStatus;
            }

            if (footer) {
                footer.textContent =
                    oldFooter;
            }

        },
        1300
    );
}

function disturbTheVeil() {

    archiveState.veil =
        !archiveState.veil;

    saveArchiveState();

    document.body.classList.toggle(
        "veil-disturbed",
        archiveState.veil
    );

    const btn =
        document.getElementById(
            "veil-toggle"
        );

    if (btn) {

        btn.textContent =
            archiveState.veil
                ? "◈ Veil Disturbed"
                : "◈ Disturb the Veil";

        btn.classList.toggle(
            "active",
            archiveState.veil
        );
    }

    if (archiveState.veil) {

        veilDisturbed = true;

        discover(
            "veil",
            "THE VEIL IS THIN · discovery recorded"
        );

        addCorruption(
            12,
            "VEIL DISTURBANCE · archive integrity reduced"
        );

        showWhisper(
            "you should not have done that"
        );

        glitchArchive();

    } else {

        veilDisturbed = false;

        reduceCorruption(3);

        showWhisper(
            "the veil settles"
        );

    }
}

function bindPresence() {

    const sigil =
        document.getElementById(
            "altar-sigil"
        );

    if (!sigil) {
        return;
    }

    const restore = () => {

        if (!archiveState.bound) {
            return;
        }

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

    };

    restore();

    const bind = () => {

        sigil.classList.add(
            "bound"
        );

        archiveState.bound =
            true;

        saveArchiveState();

        discover(
            "seal",
            "PRESENCE BOUND · visitor record updated"
        );

        addCorruption(5);

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

        document.body.classList.remove(
            "presence-flash"
        );

        void document.body.offsetWidth;

        document.body.classList.add(
            "presence-flash"
        );

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

function bindSealedCuriosity() {

    const card =
        document.getElementById(
            "sealed-curio"
        );

    if (!card) {
        return;
    }

    if (
        archiveState.conceptOpened
    ) {
        card.classList.add(
            "revealed"
        );
    }

    const reveal = () => {

        card.classList.toggle(
            "revealed"
        );

        const revealed =
            card.classList.contains(
                "revealed"
            );

        archiveState.conceptOpened =
            revealed;

        saveArchiveState();

        const p =
            card.querySelector(
                "p"
            );

        const status =
            card.querySelector(
                ".status-pill"
            );

        if (revealed) {

            discover(
                "concept-note",
                "RESTRICTED NOTE OPENED · this entry was waiting"
            );

            addCorruption(7);

            if (p) {

                p.textContent =
                    "You found the note. The concept is real; the artifact is not. Yet.";

            }

            if (status) {

                status.textContent =
                    "Classification: PLANNED / NOT FORGED";

            }

        } else {

            if (p) {

                p.textContent =
                    "Not forged yet. A planned utility for cleaning, structuring, and validating malformed JSON payloads.";

            }

            if (status) {

                status.textContent =
                    "Click to inspect restricted note";

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

function bindHiddenRune() {

    const rune =
        document.getElementById(
            "hidden-rune"
        );

    if (!rune) {
        return;
    }

    const activate = () => {

        if (
            !hasDiscovery("rune")
        ) {

            discover(
                "rune",
                "HIDDEN RUNE FOUND · the archive noticed your curiosity"
            );

            addCorruption(4);

            showWhisper(
                "you looked in the correct corner"
            );

        } else {

            showWhisper(
                "the rune is no longer hiding"
            );

        }

    };

    rune.addEventListener(
        "click",
        activate
    );

    rune.addEventListener(
        "keydown",
        e => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                activate();

            }

        }
    );
}

function bindCalmArchive() {

    const button =
        document.getElementById(
            "calm-archive"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            reduceCorruption(10);

            archiveState.candleEnergy =
                Math.min(
                    100,
                    archiveState.candleEnergy + 12
                );

            saveArchiveState();

            showToast(
                "ARCHIVE SOOTHED · structural noise receding"
            );

            showWhisper(
                "for now, it is quiet"
            );

            resetCandle();

        }
    );
}

function updateCandle() {

    const energy =
        archiveState.candleEnergy;

    document.body.classList.toggle(
        "candle-fading",
        energy <= 35
    );

    document.body.classList.toggle(
        "candle-extinguished",
        energy <= 5
    );
}

function resetCandle() {

    archiveState.candleEnergy =
        100;

    saveArchiveState();

    updateCandle();
}

function startCandle() {

    updateCandle();

    candleTimer =
        setInterval(
            () => {

                if (document.hidden) {
                    return;
                }

                archiveState.candleEnergy =
                    Math.max(
                        0,
                        archiveState.candleEnergy - 1
                    );

                saveArchiveState();

                updateCandle();

                if (
                    archiveState.candleEnergy ===
                    35
                ) {

                    showWhisper(
                        "the candle is beginning to fail"
                    );

                }

                if (
                    archiveState.candleEnergy ===
                    5
                ) {

                    showWhisper(
                        "the light has expired"
                    );

                    addCorruption(3);

                }

            },
            60000
        );
}

function initMouseSigil() {

    const cursor =
        document.getElementById(
            "sigil-cursor"
        );

    if (
        !cursor ||
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    document.addEventListener(
        "pointermove",
        e => {

            cursor.style.left =
                `${e.clientX}px`;

            cursor.style.top =
                `${e.clientY}px`;

            cursor.style.opacity =
                "1";

        }
    );

    document.addEventListener(
        "pointerleave",
        () => {
            cursor.style.opacity =
                "0";
        }
    );
}

function initTomeParallax() {

    const tome =
        document.getElementById(
            "tome"
        );

    if (
        !tome ||
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    document.addEventListener(
        "pointermove",
        e => {

            const rect =
                tome.getBoundingClientRect();

            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (!inside) {

                tome.style.transform =
                    "";

                return;

            }

            const x =
                (
                    (e.clientX - rect.left) /
                    rect.width -
                    0.5
                ) * 2;

            const y =
                (
                    (e.clientY - rect.top) /
                    rect.height -
                    0.5
                ) * 2;

            tome.style.transform =
                `perspective(1800px)
                 rotateY(${x * 0.7}deg)
                 rotateX(${-y * 0.45}deg)`;

        }
    );
}

function initArchivePresence() {

    presenceTimer =
        setInterval(
            () => {

                if (document.hidden) {
                    return;
                }

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
                        Math.random() < 0.22
                    ) {

                        glitchArchive();

                        addCorruption(1);

                    }

                }

            },
            18000
        );
}

function initializeReturningState() {

    archiveState.visits += 1;

    saveArchiveState();

    updateArchiveMeta();

    updateArchiveCondition();

    currentSpread =
        Number.isInteger(
            archiveState.spread
        )
            ? archiveState.spread
            : 0;

    veilDisturbed =
        Boolean(
            archiveState.veil
        );

    if (veilDisturbed) {
        document.body.classList.add(
            "veil-disturbed"
        );
    }

    if (
        archiveState.corruption >= 35
    ) {
        document.body.classList.add(
            "corruption-high"
        );
    }

    if (
        archiveState.corruption >= 70
    ) {
        document.body.classList.add(
            "corruption-critical"
        );
    }

    turnToPage(
        currentSpread
    );

    setTimeout(
        () => {

            if (
                archiveState.visits === 1
            ) {

                showWhisper(
                    "the archive is open"
                );

            } else if (
                archiveState.visits === 2
            ) {

                showWhisper(
                    "you returned"
                );

                discover(
                    "returning",
                    "RETURN VISITOR DETECTED · memory retained"
                );

            } else {

                showWhisper(
                    "welcome back, archivist"
                );

            }

        },
        1400
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeReturningState();

        bindPresence();

        bindSealedCuriosity();

        bindHiddenRune();

        bindCalmArchive();

        initMouseSigil();

        initTomeParallax();

        initArchivePresence();

        startCandle();

        const audioBtn =
            document.getElementById(
                "audio-toggle"
            );

        if (audioBtn) {

            audioBtn.addEventListener(
                "click",
                toggleAmbientDrone
            );

        }

        const veilBtn =
            document.getElementById(
                "veil-toggle"
            );

        if (veilBtn) {

            veilBtn.addEventListener(
                "click",
                disturbTheVeil
            );

        }

        document.addEventListener(
            "keydown",
            e => {

                if (
                    e.key ===
                    "ArrowRight"
                ) {
                    nextPage();
                }

                if (
                    e.key ===
                    "ArrowLeft"
                ) {
                    prevPage();
                }

                if (
                    e.key.toLowerCase() ===
                    "v"
                ) {
                    disturbTheVeil();
                }

            }
        );

    }
);

window.addEventListener(
    "beforeunload",
    () => {

        if (presenceTimer) {
            clearInterval(
                presenceTimer
            );
        }

        if (candleTimer) {
            clearInterval(
                candleTimer
            );
        }

    }
);
