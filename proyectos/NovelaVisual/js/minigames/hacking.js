// Hacking Minigame (Memory Sequence)
/* global monogatari */

window.minigameHacking = function () {
    return new Promise((resolve) => {
        // Setup DOM
        const overlay = document.createElement('div');
        overlay.id = 'minigame-overlay';
        overlay.style.display = 'flex'; // JS sets flex, CSS sets none. Inline style wins.

        const container = document.createElement('div');
        container.id = 'minigame-container';

        const title = document.createElement('div');
        title.className = 'minigame-title';
        title.innerText = 'Desencriptación de Secuencia';

        const instruct = document.createElement('div');
        instruct.className = 'minigame-instructions';
        instruct.innerText = 'Memoriza la secuencia y repítela.';

        const grid = document.createElement('div');
        grid.id = 'hacking-grid';

        // Create 9 buttons
        const buttons = [];
        for (let i = 0; i < 9; i++) {
            const btn = document.createElement('div');
            btn.className = 'hacking-btn';
            btn.dataset.index = i;
            grid.appendChild(btn);
            buttons.push(btn);
        }

        const status = document.createElement('div');
        status.id = 'minigame-status';
        status.innerText = 'Preparado...';

        container.appendChild(title);
        container.appendChild(instruct);
        container.appendChild(grid);
        container.appendChild(status);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Game Logic
        const sequenceLength = 5;
        let sequence = [];
        let playerStep = 0;
        let isInputActive = false;

        function generateSequence() {
            sequence = [];
            for (let i = 0; i < sequenceLength; i++) {
                sequence.push(Math.floor(Math.random() * 9));
            }
        }

        async function playSequence() {
            isInputActive = false;
            status.innerText = 'Observa...';
            playerStep = 0;

            await new Promise(r => setTimeout(r, 1000));

            for (let i = 0; i < sequence.length; i++) {
                const btnIndex = sequence[i];
                const btn = buttons[btnIndex];

                // Flash
                btn.classList.add('active');
                await new Promise(r => setTimeout(r, 500));
                btn.classList.remove('active');
                await new Promise(r => setTimeout(r, 200));
            }

            status.innerText = '¡Repite la secuencia!';
            isInputActive = true;
        }

        function handleInput(index) {
            if (!isInputActive) return;

            // Feedback
            const btn = buttons[index];
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 200);

            if (index === sequence[playerStep]) {
                playerStep++;
                if (playerStep >= sequence.length) {
                    // Win
                    status.innerText = 'Acceso Concedido';
                    status.style.color = '#0f0';
                    isInputActive = false;
                    setTimeout(() => endGame(true), 1500);
                }
            } else {
                // Fail
                status.innerText = 'Error de Secuencia';
                status.style.color = '#f00';
                isInputActive = false;
                setTimeout(() => endGame(false), 1500);
            }
        }

        function endGame(success) {
            document.body.removeChild(overlay);
            resolve(success);
        }

        // Listeners
        buttons.forEach((btn, idx) => {
            btn.addEventListener('click', () => handleInput(idx));
        });

        // Start
        generateSequence();
        playSequence();
    });
};
