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
        gameSpeed: 150, // Slower initial speed for better control
        isPaused: false,
        gameStarted: false
    };

    // Initialize game
    document.addEventListener('keydown', handleKeyPress);
    initGame();

    function initGame(): void {
        // Clear any existing timeouts/intervals
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = null;
        }
        
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
        gameState.gameSpeed = 150;
        gameState.food = generateFood();
        
        updateScore();
        
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        // Start game loop
        requestAnimationFrame(gameStep);
    }

    function updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${gameState.score}`;
        }
    }

    function generateFood(): Point {
        // Pre-calculate empty spaces for better performance
        const emptySpaces: Point[] = [];
        for (let x = 0; x < tileCount; x++) {
            for (let y = 0; y < tileCount; y++) {
                if (!gameState.snake.some(segment => segment.x === x && segment.y === y)) {
                    emptySpaces.push({ x, y });
                }
            }
        }
        
        // Randomly select one empty space
        if (emptySpaces.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptySpaces.length);
            return emptySpaces[randomIndex];
        }
        
        // Fallback (shouldn't happen unless snake fills the entire grid)
        return { x: 0, y: 0 };
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
                if (!goingRight && !gameState.gameStarted) {
                    gameState.dx = -1;
                    gameState.dy = 0;
                    startGame();
                } else if (!goingRight) {
                    gameState.dx = -1;
                    gameState.dy = 0;
                }
                break;
            case 'ArrowUp':
            case 'w':
                if (!goingDown && !gameState.gameStarted) {
                    gameState.dx = 0;
                    gameState.dy = -1;
                    startGame();
                } else if (!goingDown) {
                    gameState.dx = 0;
                    gameState.dy = -1;
                }
                break;
            case 'ArrowRight':
            case 'd':
                if (!goingLeft && !gameState.gameStarted) {
                    gameState.dx = 1;
                    gameState.dy = 0;
                    startGame();
                } else if (!goingLeft) {
                    gameState.dx = 1;
                    gameState.dy = 0;
                }
                break;
            case 'ArrowDown':
            case 's':
                if (!goingUp && !gameState.gameStarted) {
                    gameState.dx = 0;
                    gameState.dy = 1;
                    startGame();
                } else if (!goingUp) {
                    gameState.dx = 0;
                    gameState.dy = 1;
                }
                break;
            case ' ':
                togglePause();
                break;
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
        if (gameState.isPaused) {
            requestAnimationFrame(gameStep);
            return;
        }

        // Only process movement if the game has started (player has pressed a key)
        if (gameState.gameStarted) {
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
                updateScore();
                
                // Generate new food position before updating game speed
                gameState.food = generateFood();
                
                // Smoother speed increase without interval changes
                if (gameState.gameSpeed > 80) {
                    gameState.gameSpeed = Math.max(80, gameState.gameSpeed - 2);
                }
            } else {
                gameState.snake.pop();
            }
        }

        drawGame();

        // Schedule next game step with current speed
        setTimeout(() => {
            requestAnimationFrame(gameStep);
        }, gameState.gameSpeed);
    }

    function startGame(): void {
        if (!gameState.gameStarted) {
            gameState.gameStarted = true;
            drawGame();
        }
    }

    function drawGame(): void {
        // Clear canvas
        ctx.fillStyle = '#1a2f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake with glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#39ff14';
        ctx.fillStyle = '#39ff14';
        gameState.snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Draw food with glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0';
        ctx.fillStyle = '#ff0';
        ctx.fillRect(gameState.food.x * gridSize, gameState.food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
    }

    function gameOver(): void {
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        if (gameOverElement) {
            if (finalScoreElement) {
                finalScoreElement.textContent = gameState.score.toString();
            }
            gameOverElement.style.display = 'block';
        }
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = null;
        }
    }

    // Make resetGame available globally for the button
    (window as any).resetGame = initGame;
});
