// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    // Colors
    const colors = {
        snake: '#39ff14', // Neon green
        food: '#fff95b',  // Neon yellow
        text: '#39ff14'   // Neon green
    };

    let snake = [];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameLoop;
    let gameSpeed = 100;
    let isPaused = false;
    let gameStarted = false;

    // Initialize game
    document.addEventListener('keydown', handleKeyPress);
    initGame();

    function initGame() {
        // Clear any existing game loop
        if (gameLoop) clearInterval(gameLoop);
        
        // Initialize snake in the middle
        snake = [
            { x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) }
        ];
        
        // Reset game state
        dx = 0;
        dy = 0;
        score = 0;
        isPaused = false;
        gameStarted = false;
        gameSpeed = 100;
        food = generateFood();
        
        // Update score display
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('gameOver').style.display = 'none';
        
        // Start drawing
        drawGame();
    }

    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    function handleKeyPress(event) {
        // Prevent default behavior for arrow keys and space
        if ([32, 37, 38, 39, 40, 65, 68, 83, 87].includes(event.keyCode)) {
            event.preventDefault();
        }

        // Handle pause with spacebar
        if (event.keyCode === 32) {
            if (gameStarted) togglePause();
            return;
        }

        if (isPaused) return;

        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;

        // Start game on first key press
        if (!gameStarted && [37, 38, 39, 40, 65, 68, 83, 87].includes(event.keyCode)) {
            gameStarted = true;
            gameLoop = setInterval(gameStep, gameSpeed);
        }

        // Arrow keys and WASD
        if ((event.keyCode === 37 || event.keyCode === 65) && !goingRight) { // Left Arrow or A
            dx = -1;
            dy = 0;
        }
        if ((event.keyCode === 38 || event.keyCode === 87) && !goingDown) { // Up Arrow or W
            dx = 0;
            dy = -1;
        }
        if ((event.keyCode === 39 || event.keyCode === 68) && !goingLeft) { // Right Arrow or D
            dx = 1;
            dy = 0;
        }
        if ((event.keyCode === 40 || event.keyCode === 83) && !goingUp) { // Down Arrow or S
            dx = 0;
            dy = 1;
        }
    }

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameLoop);
            // Draw "PAUSED" text
            ctx.fillStyle = colors.text;
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = colors.text;
            ctx.shadowBlur = 15;
            ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
            ctx.shadowBlur = 0;
        } else {
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    }

    function gameStep() {
        if (isPaused) return;

        // Move snake
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Check for collisions
        if (head.x < 0 || head.x >= tileCount || 
            head.y < 0 || head.y >= tileCount ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            food = generateFood();
            // Increase speed slightly
            if (gameSpeed > 50) {
                clearInterval(gameLoop);
                gameSpeed = Math.max(50, gameSpeed - 2);
                gameLoop = setInterval(gameStep, gameSpeed);
            }
        } else {
            snake.pop();
        }

        // Draw game
        drawGame();
    }

    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!gameStarted) {
            // Draw start message
            ctx.fillStyle = colors.text;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = colors.text;
            ctx.shadowBlur = 15;
            ctx.fillText('Press Arrow Keys or WASD to Start', canvas.width/2, canvas.height/2);
            ctx.font = '16px Arial';
            ctx.fillText('Space to Pause', canvas.width/2, canvas.height/2 + 30);
            ctx.shadowBlur = 0;
            return;
        }

        // Draw snake with gradient effect
        snake.forEach((segment, index) => {
            ctx.fillStyle = colors.snake;
            ctx.shadowColor = colors.snake;
            ctx.shadowBlur = 15;
            
            // Create a slight gradient effect along the snake
            const alpha = 1 - (index / (snake.length * 2));
            ctx.globalAlpha = Math.max(0.4, alpha);
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Reset shadow and alpha for food
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Draw food with pulsing effect
        ctx.fillStyle = colors.food;
        ctx.shadowColor = colors.food;
        const pulseSize = Math.sin(Date.now() / 200) * 2;
        ctx.shadowBlur = 15 + pulseSize;
        
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize/2,
            food.y * gridSize + gridSize/2,
            (gridSize/2 - 2) + pulseSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    function gameOver() {
        clearInterval(gameLoop);
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = score;
    }

    // Make resetGame available globally for the button
    window.resetGame = initGame;
});
