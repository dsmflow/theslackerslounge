// Constants
const GRID_SIZE = 20;
const BASE_CELL_SIZE = 25;
const INITIAL_SPEED = 150;
const MAX_SPEED = 100;
const SPEED_INCREMENT = 1;

// Colors
const COLORS = {
    background: '#1a1a1a',
    grid: 'rgba(245, 230, 211, 0.125)',
    gold: '#ffd700',
    neonGreen: '#33ff77',
    neonWhite: '#ffffff',
    headColor: '#60a5fa',
};

// Types
interface Position {
    x: number;
    y: number;
}

interface GameState {
    snake: Position[];
    food: Position;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    gameOver: boolean;
    score: number;
    paused: boolean;
}

// Helper Functions
const getRandomPosition = (): Position => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
});

const getDynamicCellSize = (): number => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const availableWidth = window.innerWidth - 32;
        return Math.floor(availableWidth / GRID_SIZE);
    }
    return BASE_CELL_SIZE;
};

// Game Class
class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cellSize: number;
    private gameState: GameState;
    private highScore: number;
    private speed: number;
    private lastRenderTime: number;
    private animationFrameId?: number;

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        this.ctx = context;

        this.cellSize = getDynamicCellSize();
        this.updateCanvasSize();

        this.gameState = {
            snake: [{ x: 10, y: 10 }],
            food: getRandomPosition(),
            direction: 'RIGHT',
            gameOver: false,
            score: 0,
            paused: false,
        };

        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
        this.speed = INITIAL_SPEED;
        this.lastRenderTime = 0;

        this.setupEventListeners();
        this.updateScoreDisplay();
        this.gameLoop(0);
    }

    private updateCanvasSize(): void {
        this.canvas.width = GRID_SIZE * this.cellSize;
        this.canvas.height = GRID_SIZE * this.cellSize;
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
        window.addEventListener('resize', () => {
            this.cellSize = getDynamicCellSize();
            this.updateCanvasSize();
        });
    }

    private handleKeyPress(event: KeyboardEvent): void {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'w', 'a', 's', 'd'].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === ' ' || event.key === 'Space') {
            this.gameState.paused = !this.gameState.paused;
            return;
        }

        if (this.gameState.paused) return;

        const newDirection = {
            'ArrowUp': 'UP',
            'w': 'UP',
            'ArrowDown': 'DOWN',
            's': 'DOWN',
            'ArrowLeft': 'LEFT',
            'a': 'LEFT',
            'ArrowRight': 'RIGHT',
            'd': 'RIGHT',
        }[event.key];

        if (newDirection) {
            const opposites = {
                'UP': 'DOWN',
                'DOWN': 'UP',
                'LEFT': 'RIGHT',
                'RIGHT': 'LEFT',
            };

            if (this.gameState.snake.length === 1 || 
                newDirection !== opposites[this.gameState.direction as keyof typeof opposites]) {
                this.gameState.direction = newDirection as GameState['direction'];
            }
        }
    }

    private moveSnake(): void {
        if (this.gameState.gameOver || this.gameState.paused) return;

        const newSnake = [...this.gameState.snake];
        const head = { ...newSnake[0] };

        switch (this.gameState.direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }

        // Check for collisions with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            this.gameState.gameOver = true;
            return;
        }

        // Check for collisions with self
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameState.gameOver = true;
            return;
        }

        newSnake.unshift(head);

        // Check if snake ate food
        if (head.x === this.gameState.food.x && head.y === this.gameState.food.y) {
            // Generate new food position
            let newFood;
            do {
                newFood = getRandomPosition();
            } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

            this.gameState.food = newFood;
            this.gameState.score += 10;
            this.updateHighScore();
            this.speed = Math.max(MAX_SPEED, this.speed - SPEED_INCREMENT);
        } else {
            newSnake.pop();
        }

        this.gameState.snake = newSnake;
        this.updateScoreDisplay();
    }

    private updateHighScore(): void {
        if (this.gameState.score > this.highScore) {
            this.highScore = this.gameState.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }

    private updateScoreDisplay(): void {
        const currentScoreElement = document.getElementById('current-score');
        const highScoreElement = document.getElementById('high-score');
        
        if (currentScoreElement) currentScoreElement.textContent = this.gameState.score.toString();
        if (highScoreElement) highScoreElement.textContent = this.highScore.toString();
    }

    private drawGame(): void {
        // Clear canvas with dark background
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = COLORS.grid;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i <= GRID_SIZE; i++) {
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, GRID_SIZE * this.cellSize);
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(GRID_SIZE * this.cellSize, i * this.cellSize);
        }
        this.ctx.stroke();

        // Pre-calculate common values
        const rhombusSize = this.cellSize * 0.8;
        const halfCell = this.cellSize / 2;

        // Draw snake segments
        this.ctx.lineWidth = 2;
        this.gameState.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const centerX = segment.x * this.cellSize + halfCell;
            const centerY = segment.y * this.cellSize + halfCell;
            
            // Set color based on segment position
            this.ctx.strokeStyle = isHead ? COLORS.headColor : (index % 2 === 0 ? COLORS.neonGreen : COLORS.gold);
            
            // Add glow only to head for better performance
            if (isHead) {
                this.ctx.shadowBlur = 12;
                this.ctx.shadowColor = COLORS.headColor;
            }
            
            // Draw rhombus
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY - rhombusSize/2);
            this.ctx.lineTo(centerX + rhombusSize/2, centerY);
            this.ctx.lineTo(centerX, centerY + rhombusSize/2);
            this.ctx.lineTo(centerX - rhombusSize/2, centerY);
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Reset shadow after head
            if (isHead) {
                this.ctx.shadowBlur = 0;
            }
        });

        // Draw food
        this.ctx.strokeStyle = COLORS.neonWhite;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = COLORS.neonWhite;
        
        const foodX = this.gameState.food.x * this.cellSize + this.cellSize / 2;
        const foodY = this.gameState.food.y * this.cellSize + this.cellSize / 2;
        const foodRadius = this.cellSize * 0.25;
        
        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw game over or paused text
        if (this.gameState.gameOver || this.gameState.paused) {
            const text = this.gameState.gameOver ? 'Game Over!' : 'Paused';
            this.ctx.fillStyle = COLORS.neonWhite;
            this.ctx.font = '48px var(--font-display)';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = COLORS.neonWhite;
            this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;

            if (this.gameState.gameOver) {
                this.ctx.font = '24px var(--font-display)';
                this.ctx.fillText('Press Space to restart', this.canvas.width / 2, this.canvas.height / 2 + 48);
            }
        }
    }

    private gameLoop(timestamp: number): void {
        if (timestamp - this.lastRenderTime >= this.speed) {
            this.moveSnake();
            this.lastRenderTime = timestamp;
        }

        this.drawGame();

        if (this.gameState.gameOver && this.gameState.paused) {
            this.resetGame();
        } else {
            this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    private resetGame(): void {
        this.gameState = {
            snake: [{ x: 10, y: 10 }],
            food: getRandomPosition(),
            direction: 'RIGHT',
            gameOver: false,
            score: 0,
            paused: false,
        };
        this.speed = INITIAL_SPEED;
        this.updateScoreDisplay();
    }

    public destroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener('keydown', this.handleKeyPress);
    }
}

// Initialize game
new SnakeGame();
