// Reflex Minigame (Agility Test)
/* global monogatari */

window.minigameReflex = function () {
    return new Promise((resolve) => {
        // Setup DOM
        const overlay = document.createElement('div');
        overlay.id = 'minigame-overlay';
        overlay.style.display = 'flex'; // JS sets flex, CSS sets none. Inline style wins.

        const container = document.createElement('div');
        container.id = 'minigame-container';

        const title = document.createElement('div');
        title.className = 'minigame-title';
        title.innerText = 'Sincronización Neural';

        const instruct = document.createElement('div');
        instruct.className = 'minigame-instructions';
        instruct.innerText = 'Pulsa ESPACIO o HAZ CLIC cuando la barra esté en la zona verde. (3 Aciertos necesarios)';

        const barContainer = document.createElement('div');
        barContainer.id = 'reflex-bar-container';

        const target = document.createElement('div');
        target.id = 'reflex-target-zone';
        // Randomize target position slightly
        let targetLeft = Math.floor(Math.random() * (250 - 0) + 0);
        target.style.left = targetLeft + 'px';
        target.style.width = '50px';

        const cursor = document.createElement('div');
        cursor.id = 'reflex-cursor';

        const status = document.createElement('div');
        status.id = 'minigame-status';
        status.innerText = 'Aciertos: 0/3';

        barContainer.appendChild(target);
        barContainer.appendChild(cursor);
        container.appendChild(title);
        container.appendChild(instruct);
        container.appendChild(barContainer);
        container.appendChild(status);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Game Logic
        let score = 0;
        let fails = 0;
        let direction = 1;
        let position = 0;
        let speed = 4;
        let gameLoop;
        let isRunning = true;

        function update() {
            if (!isRunning) return;
            position += speed * direction;
            if (position >= 295 || position <= 0) {
                direction *= -1;
            }
            cursor.style.left = position + 'px';
            gameLoop = requestAnimationFrame(update);
        }

        function checkHit() {
            if (!isRunning) return;

            // Validate Hit
            // Target Left to Target Right
            // We use parseInt because style.left includes 'px'
            let tLeft = parseInt(target.style.left);
            let tRight = tLeft + 50;

            if (position >= tLeft && position <= tRight) {
                // Hit
                score++;
                status.innerText = `Aciertos: ${score}/3`;
                status.style.color = '#0f0';

                // Increase difficulty
                speed += 2;
                // Move target
                targetLeft = Math.floor(Math.random() * (240 - 0) + 0);
                target.style.left = targetLeft + 'px';

                if (score >= 3) {
                    endGame(true);
                }
            } else {
                // Miss
                fails++;
                status.innerText = `Fallos: ${fails}/3`;
                status.style.color = '#f00';
                if (fails >= 3) {
                    endGame(false);
                }
            }
        }

        function endGame(success) {
            isRunning = false;
            cancelAnimationFrame(gameLoop);
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(success);
            }, 1000);
        }

        // Input Listeners
        function inputHandler(e) {
            if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'mousedown') {
                checkHit();
            }
        }

        document.addEventListener('keydown', inputHandler);
        overlay.addEventListener('mousedown', inputHandler);

        // Start Loop
        update();

        // Cleanup listener helper (attached to element in closure)
        // Ideally we remove listeners on endGame but here we just destroy the DOM which removes mousedown
        // Keydown needs explicit removal
        const originalEndGame = endGame;
        endGame = function (s) {
            document.removeEventListener('keydown', inputHandler);
            originalEndGame(s);
        };
    });
};
