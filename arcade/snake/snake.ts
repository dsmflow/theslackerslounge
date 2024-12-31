// Types
interface Point {
    x: number;
    y: number;
}

interface GameState {
    snake: Point[];
    food: Point;
    dx: number;
    dy: number;
    score: number;
    gameLoop: number | null;
    gameSpeed: number;
    isPaused: boolean;
    gameStarted: boolean;
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    // Game state
    const gameState: GameState = {
        snake: [],
        food: { x: 15, y: 15 },
        dx: 0,
        dy: 0,
        score: 0,
        gameLoop: null,
        gameSpeed: 100,
        isPaused: false,
        gameStarted: false
    };

    // Initialize game
    document.addEventListener('keydown', handleKeyPress);
    initGame();

    function initGame(): void {
        // Clear any existing game loop
        if (gameState.gameLoop) clearInterval(gameState.gameLoop);
        
        // Initialize snake in the middle
        gameState.snake = [
            { x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) }
        ];
        
        // Reset game state
        gameState.dx = 0;
        gameState.dy = 0;
        gameState.score = 0;
        gameState.isPaused = false;
        gameState.gameStarted = false;
        gameState.gameSpeed = 100;
        gameState.food = generateFood();
        
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${gameState.score}`;
        }
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        // Start drawing
        drawGame();
    }

    function generateFood(): Point {
        let newFood: Point;
        do {
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    function handleKeyPress(event: KeyboardEvent): void {
        if (gameState.isPaused) return;

        const goingUp = gameState.dy === -1;
        const goingDown = gameState.dy === 1;
        const goingRight = gameState.dx === 1;
        const goingLeft = gameState.dx === -1;

        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
                if (!goingRight) {
                    gameState.dx = -1;
                    gameState.dy = 0;
                }
                break;
            case 'ArrowUp':
            case 'w':
                if (!goingDown) {
                    gameState.dx = 0;
                    gameState.dy = -1;
                }
                break;
            case 'ArrowRight':
            case 'd':
                if (!goingLeft) {
                    gameState.dx = 1;
                    gameState.dy = 0;
                }
                break;
            case 'ArrowDown':
            case 's':
                if (!goingUp) {
                    gameState.dx = 0;
                    gameState.dy = 1;
                }
                break;
            case ' ':
                togglePause();
                break;
        }

        // Start game on first key press
        if (!gameState.gameStarted && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'a', 'w', 'd', 's'].includes(event.key)) {
            gameState.gameStarted = true;
            gameState.gameLoop = window.setInterval(gameStep, gameState.gameSpeed);
        }
    }

    function togglePause(): void {
        gameState.isPaused = !gameState.isPaused;
        const pauseElement = document.getElementById('pause');
        if (pauseElement) {
            pauseElement.style.display = gameState.isPaused ? 'block' : 'none';
        }
    }

    function gameStep(): void {
        if (gameState.isPaused) return;

        // Move snake
        const head: Point = { 
            x: gameState.snake[0].x + gameState.dx, 
            y: gameState.snake[0].y + gameState.dy 
        };
        
        // Check for collisions
        if (head.x < 0 || head.x >= tileCount || 
            head.y < 0 || head.y >= tileCount ||
            gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        gameState.snake.unshift(head);

        // Check if food is eaten
        if (head.x === gameState.food.x && head.y === gameState.food.y) {
            gameState.score += 10;
            const scoreElement = document.getElementById('score');
            if (scoreElement) {
                scoreElement.textContent = `Score: ${gameState.score}`;
            }
            gameState.food = generateFood();
            // Increase speed slightly
            if (gameState.gameSpeed > 70) {
                if (gameState.gameLoop) clearInterval(gameState.gameLoop);
                gameState.gameSpeed = Math.max(70, gameState.gameSpeed - 1);
                gameState.gameLoop = window.setInterval(gameStep, gameState.gameSpeed);
            }
        } else {
            gameState.snake.pop();
        }

        // Draw game
        drawGame();
    }

    function drawGame(): void {
        // Clear canvas
        ctx.fillStyle = '#1a2f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        ctx.fillStyle = '#39ff14';
        gameState.snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Draw food
        ctx.fillStyle = '#ff0';
        ctx.fillRect(gameState.food.x * gridSize, gameState.food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function gameOver(): void {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
        if (gameState.gameLoop) clearInterval(gameState.gameLoop);
    }

    // Make resetGame available globally for the button
    (window as any).resetGame = initGame;
});
