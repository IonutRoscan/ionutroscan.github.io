document.addEventListener('DOMContentLoaded', () => {
    
    // 1. TOME TAB FILTERING
    const tabs = document.querySelectorAll('.nav-tab');
    const cards = document.querySelectorAll('.artifact-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 2. INTERACTIVE TERMINAL
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim().toLowerCase();
                processCommand(command);
                terminalInput.value = '';
            }
        });
    }

    function processCommand(cmd) {
        printLine(`🜁 ionut@archive:~$ ${cmd}`);

        switch(cmd) {
            case 'help':
                printLine("Recognized Spells: [about] [artifacts] [skills] [clear] [sudo summon]");
                break;
            case 'about':
                printLine("Ionuț Roșcan — Digital Architect, Tool Weaver & Occult Developer.");
                break;
            case 'artifacts':
                printLine("Known Artefacts: Clank Lorebook Importer, JSON Formatter, Audio Carver.");
                break;
            case 'skills':
                printLine("Masteries: Web Sorcery (85%), Python (80%), Godot (75%), Sound Synthesis (75%).");
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case 'sudo summon':
            case 'summon':
                openSecretModal();
                printLine("✦ THE CONJURATION HAS SUCCEEDED ✦", "system-msg");
                break;
            case '':
                break;
            default:
                printLine(`Command not recognized: '${cmd}'. Type 'help' for incantations.`, "highlight");
        }

        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `term-line ${className}`;
        line.textContent = text;
        terminalOutput.appendChild(line);
    }

    // 3. KONAMI CODE EASTER EGG (↑ ↑ ↓ ↓ ← → ← → B A)
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                openSecretModal();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // 4. MODAL CONTROLS
    const modal = document.getElementById('secret-modal');
    const trigger = document.getElementById('summon-trigger');

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openSecretModal();
        });
    }

    window.openSecretModal = () => {
        if (modal) modal.style.display = 'flex';
    };

    window.closeSecretModal = () => {
        if (modal) modal.style.display = 'none';
    };
});
