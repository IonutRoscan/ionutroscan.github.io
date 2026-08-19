/* ================================================================
   ARCHIVE TERMINAL v5
   ================================================================ */

const terminalHistory = [];
let terminalHistoryIndex = -1;

function openArchiveTerminal() {
    const overlay = document.getElementById("terminal-overlay");
    const input = document.getElementById("terminal-input");

    if (!overlay) return;

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("terminal-open");

    setTimeout(() => input?.focus(), 80);
}

function closeArchiveTerminal() {
    const overlay = document.getElementById("terminal-overlay");

    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("terminal-open");
}

function terminalPrint(text, type = "terminal-output") {
    const screen = document.getElementById("terminal-screen");
    if (!screen) return;

    const line = document.createElement("div");

    line.className =
        `terminal-line ${type}`;

    line.textContent = text;

    screen.appendChild(line);

    screen.scrollTop =
        screen.scrollHeight;
}

function terminalPrintBlock(
    lines,
    type = "terminal-output"
) {
    lines.forEach(
        line => terminalPrint(
            line,
            type
        )
    );
}

function invokeArtifact(id) {

    const artifact =
        artifacts.find(
            a => a.id === id
        );

    if (!artifact) {

        terminalPrint(
            `ARTIFACT ${id} DOES NOT EXIST.`,
            "terminal-error"
        );

        return;
    }

    if (!artifact.released) {

        terminalPrint(
            `ARTIFACT ${id} IS NOT OPERATIONAL.`,
            "terminal-warning"
        );

        terminalPrint(
            "The archive refuses to fabricate a release."
        );

        return;
    }

    discover(
        "terminal-invoke",
        "ARTIFACT INVOCATION REQUESTED · 001"
    );

    addCorruption(2);

    terminalPrint(
        `INVOCATION ACCEPTED · ${artifact.name}`,
        "terminal-success"
    );

    terminalPrint(
        "Opening the released artifact..."
    );

    setTimeout(() => {

        const link =
            document.querySelector(
                'a[href="clank-lorebook-importer.zip"]'
            );

        if (link) {

            link.click();

        } else {

            terminalPrint(
                "INVOCATION FAILED · artifact file not found in this deployment.",
                "terminal-error"
            );

        }

    }, 350);
}

function terminalStatus() {

    terminalPrintBlock([
        "ARCHIVE STATUS",
        `VISITS       ${String(
            archiveState.visits
        ).padStart(3, "0")}`,
        `DISCOVERIES  ${String(
            archiveState.discoveries.length
        ).padStart(3, "0")}`,
        `INTEGRITY    ${
            100 - archiveState.corruption
        }%`,
        `CORRUPTION   ${
            archiveState.corruption
        }%`,
        `CANDLE       ${
            archiveState.candleEnergy
        }%`,
        `PRESENCE     ${
            archiveState.bound
                ? "BOUND"
                : "UNBOUND"
        }`,
        `VEIL         ${
            archiveState.veil
                ? "DISTURBED"
                : "SEALED"
        }`,
        `FOLIO        ${
            spreadLabels[currentSpread]
        }`
    ]);
}

function terminalList() {

    terminalPrint(
        "REGISTERED ARTIFACTS",
        "terminal-success"
    );

    artifacts.forEach(
        artifact => {

            terminalPrint(
                `[${artifact.id}] ${artifact.name} · ${artifact.status}`
            );

        }
    );
}

function terminalInspect(id) {

    const artifact =
        artifacts.find(
            a => a.id === id
        );

    if (!artifact) {

        terminalPrint(
            `NO RECORD FOUND FOR ${id}.`,
            "terminal-error"
        );

        return;
    }

    discover(
        `inspect-${id}`,
        `ARTIFACT ${id} INSPECTED`
    );

    terminalPrintBlock([
        `ARTIFACT ${artifact.id}`,
        `NAME        ${artifact.name}`,
        `STATUS      ${artifact.status}`,
        `RELEASED    ${
            artifact.released
                ? "YES"
                : "NO"
        }`,
        `CLASS       ${
            artifact.released
                ? "UTILITY"
                : "CONCEPT"
        }`,
        "",
        artifact.description
    ]);
}

function terminalDiscoveries() {

    if (
        !archiveState.discoveries.length
    ) {

        terminalPrint(
            "NO DISCOVERIES RECORDED.",
            "terminal-warning"
        );

        return;
    }

    terminalPrint(
        "RECORDED DISCOVERIES",
        "terminal-success"
    );

    archiveState.discoveries.forEach(
        (id, index) => {

            terminalPrint(
                `${String(
                    index + 1
                ).padStart(2, "0")} · ${id}`
            );

        }
    );
}

function terminalWhoAmI() {

    terminalPrintBlock([
        "VISITOR RECORD",
        "ROLE         ARCHIVIST",
        `VISITS       ${
            archiveState.visits
        }`,
        `FIRST SEEN   ${
            new Date(
                archiveState.firstVisit ||
                Date.now()
            ).toLocaleString()
        }`,
        "IDENTITY     NOT VERIFIED",
        "",
        "The archive knows only that you returned."
    ]);
}

function terminalHistoryCommand() {

    if (!terminalHistory.length) {

        terminalPrint(
            "NO COMMANDS RECORDED THIS SESSION."
        );

        return;
    }

    terminalHistory.forEach(
        (command, index) => {

            terminalPrint(
                `${String(
                    index + 1
                ).padStart(2, "0")}  ${command}`
            );

        }
    );
}

function terminalExecute(
    rawCommand
) {

    const raw =
        rawCommand.trim();

    if (!raw) return;

    terminalHistory.push(
        raw
    );

    terminalHistoryIndex =
        terminalHistory.length;

    terminalPrint(
        `> ${raw}`,
        "terminal-command"
    );

    const parts =
        raw.split(/\s+/);

    const command =
        parts[0].toLowerCase();

    const argument =
        parts[1]?.toUpperCase();

    switch (command) {

        case "help":

            terminalPrintBlock([
                "AVAILABLE COMMANDS",
                "help              show this list",
                "clear             clear the terminal",
                "status            inspect archive condition",
                "list              list registered artifacts",
                "inspect <id>      inspect an artifact",
                "invoke <id>       invoke a released artifact",
                "discoveries       list recorded discoveries",
                "whoami             inspect visitor record",
                "history           show this session's commands",
                "open <folio>      open folio 1, 2, or 3",
                "veil              disturb the veil",
                "soothe            reduce archive corruption",
                "VII               query the forbidden folio"
            ]);

            break;


        case "clear": {

            const screen =
                document.getElementById(
                    "terminal-screen"
                );

            if (screen) {
                screen.innerHTML = "";
            }

            break;
        }


        case "status":

            terminalStatus();

            break;


        case "list":
        case "artifacts":

            terminalList();

            break;


        case "inspect":

            terminalInspect(
                argument || "001"
            );

            break;


        case "invoke":

            invokeArtifact(
                argument || "001"
            );

            break;


        case "discoveries":

            terminalDiscoveries();

            break;


        case "whoami":

            terminalWhoAmI();

            break;


        case "history":

            terminalHistoryCommand();

            break;


        case "open": {

            const requested =
                Number(argument);

            if (
                [1, 2, 3].includes(
                    requested
                )
            ) {

                turnToPage(
                    requested - 1
                );

                terminalPrint(
                    `FOLIO ${requested} OPENED.`,
                    "terminal-success"
                );

            } else {

                terminalPrint(
                    "VALID FOLIOS: 1 · 2 · 3",
                    "terminal-error"
                );

            }

            break;
        }


        case "veil":

            disturbTheVeil();

            terminalPrint(
                "VEIL COMMAND EXECUTED.",
                "terminal-warning"
            );

            break;


        case "soothe":

            reduceCorruption(
                12
            );

            archiveState.candleEnergy =
                Math.min(
                    100,
                    archiveState.candleEnergy + 15
                );

            saveArchiveState();

            updateCandle();

            terminalPrint(
                "ARCHIVE SOOTHED.",
                "terminal-success"
            );

            break;


        case "vii":
        case "7":
        case "page7":

            discover(
                "asked-vii",
                "THE ARCHIVE DOES NOT ACKNOWLEDGE FOLIO VII"
            );

            addCorruption(
                9
            );

            terminalPrintBlock([
                "QUERY: FOLIO VII",
                "",
                "RESULT: NO SUCH FOLIO",
                "",
                "The archive contains six pages.",
                "The archive contains six pages.",
                "The archive contains six pages.",
                "",
                "...doesn't it?"
            ], "terminal-warning");

            glitchArchive();

            break;


        default:

            terminalPrint(
                `UNKNOWN COMMAND: ${command}`,
                "terminal-error"
            );

            terminalPrint(
                "Type 'help' to inspect the command index."
            );
    }
}

function bindArchiveTerminal() {

    const openButton =
        document.getElementById(
            "terminal-toggle"
        );

    const closeButton =
        document.getElementById(
            "terminal-close"
        );

    const overlay =
        document.getElementById(
            "terminal-overlay"
        );

    const form =
        document.getElementById(
            "terminal-form"
        );

    const input =
        document.getElementById(
            "terminal-input"
        );

    if (
        !openButton ||
        !closeButton ||
        !overlay ||
        !form ||
        !input
    ) {
        return;
    }

    openButton.addEventListener(
        "click",
        openArchiveTerminal
    );

    closeButton.addEventListener(
        "click",
        closeArchiveTerminal
    );

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeArchiveTerminal();

            }

        }
    );

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            terminalExecute(
                input.value
            );

            input.value = "";

        }
    );

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "ArrowUp"
            ) {

                event.preventDefault();

                if (
                    !terminalHistory.length
                ) {
                    return;
                }

                terminalHistoryIndex =
                    Math.max(
                        0,
                        terminalHistoryIndex - 1
                    );

                input.value =
                    terminalHistory[
                        terminalHistoryIndex
                    ] || "";

            }


            if (
                event.key ===
                "ArrowDown"
            ) {

                event.preventDefault();

                terminalHistoryIndex =
                    Math.min(
                        terminalHistory.length,
                        terminalHistoryIndex + 1
                    );

                input.value =
                    terminalHistory[
                        terminalHistoryIndex
                    ] || "";

            }


            if (
                event.key ===
                "Escape"
            ) {

                closeArchiveTerminal();

            }

        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeArchiveTerminal();

            }

        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    bindArchiveTerminal
);
