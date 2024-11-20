import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  snake: Position[];
  food: Position;
  direction: string;
  gameOver: boolean;
  score: number;
  paused: boolean;
}

const GRID_SIZE = 20;
const BASE_CELL_SIZE = 25;
const INITIAL_SPEED = 150;
const MAX_SPEED = 80;
const SPEED_INCREMENT = 2;

// Add mobile detection and dynamic sizing
const getDynamicCellSize = () => {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // On mobile, make the grid fit the screen width with some padding
    const availableWidth = window.innerWidth - 32; // 32px for padding
    return Math.floor(availableWidth / GRID_SIZE);
  }
  return BASE_CELL_SIZE;
};

const COLORS = {
  background: '#1a1a1a',
  grid: 'rgba(245, 230, 211, 0.125)', // Brighter cream color for grid
  gold: '#ffd700',
  neonGreen: '#33ff77',
  neonWhite: '#ffffff',
  textShadow: '0 0 10px',
  headColor: '#60a5fa', // Blue color for head section
};

const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cellSize, setCellSize] = useState(getDynamicCellSize());
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: getRandomPosition(),
    direction: 'RIGHT',
    gameOver: false,
    score: 0,
    paused: false,
  });
  const [highScore, setHighScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const gameLoopRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);

  const createGradient = useCallback((ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
    const gradient = ctx.createLinearGradient(0, 0, cellSize, cellSize);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }, [cellSize]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!ctx || !canvas) return;

    // Clear canvas with dark background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines with subtle glow
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = COLORS.grid;
    ctx.beginPath();
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, GRID_SIZE * cellSize);
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(GRID_SIZE * cellSize, i * cellSize);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pre-calculate common values
    const timestamp = Date.now();
    const rhombusSize = cellSize * 0.8; // Slightly smaller than cell size
    const halfCell = cellSize / 2;

    // Draw snake segments as rhombii
    gameState.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const centerX = segment.x * cellSize + halfCell;
      const centerY = segment.y * cellSize + halfCell;
      
      // Set up color and glow effect based on segment position
      let segmentColor;
      if (isHead) {
        segmentColor = COLORS.headColor;
      } else {
        segmentColor = index % 2 === 0 ? COLORS.neonGreen : COLORS.gold;
      }
      
      ctx.shadowBlur = 12;
      ctx.shadowColor = segmentColor;
      ctx.strokeStyle = segmentColor;
      
      // Draw rhombus
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - rhombusSize/2); // Top point
      ctx.lineTo(centerX + rhombusSize/2, centerY); // Right point
      ctx.lineTo(centerX, centerY + rhombusSize/2); // Bottom point
      ctx.lineTo(centerX - rhombusSize/2, centerY); // Left point
      ctx.closePath();
      
      // Set line properties
      ctx.lineWidth = 2;
      
      // Draw outline only
      ctx.stroke();
    });

    // Draw food with wireframe style
    ctx.strokeStyle = COLORS.neonWhite;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.neonWhite;
    ctx.lineWidth = 2;
    
    const foodX = gameState.food.x * cellSize + cellSize / 2;
    const foodY = gameState.food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize * 0.25; // Half the size of cell
    
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Reset shadow effect
    ctx.shadowBlur = 0;
  }, [gameState, cellSize]);

  const moveSnake = useCallback(() => {
    if (gameState.gameOver || gameState.paused) return;

    const newSnake = [...gameState.snake];
    const head = { ...newSnake[0] };

    switch (gameState.direction) {
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
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    // Check for collisions with self
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    newSnake.unshift(head);

    // Check if snake ate food
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      // Generate new food position
      let newFood;
      do {
        newFood = getRandomPosition();
      } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

      const newScore = gameState.score + 10;
      setGameState(prev => ({
        ...prev,
        food: newFood,
        score: newScore,
      }));
      setHighScore(prev => Math.max(prev, newScore));

      // Increase speed
      setSpeed(prev => Math.max(MAX_SPEED, prev - SPEED_INCREMENT));
    } else {
      newSnake.pop();
    }

    setGameState(prev => ({ ...prev, snake: newSnake }));
  }, [gameState]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Prevent scrolling when using arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }

    if (gameState.gameOver) {
      if (event.key === 'Enter' || event.key === ' ') {
        setGameState({
          snake: [{ x: 10, y: 10 }],
          food: getRandomPosition(),
          direction: 'RIGHT',
          gameOver: false,
          score: 0,
          paused: false,
        });
        setSpeed(INITIAL_SPEED);
      }
      return;
    }

    if (event.key === ' ') {
      setGameState(prev => ({ ...prev, paused: !prev.paused }));
      return;
    }

    const newDirection = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
    }[event.key] as GameState['direction'];

    if (newDirection) {
      const currentDirection = gameState.direction;
      const invalidMoves = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      if (invalidMoves[newDirection] !== currentDirection) {
        setGameState(prev => ({ ...prev, direction: newDirection }));
      }
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastRenderTimeRef.current >= speed) {
        moveSnake();
        lastRenderTimeRef.current = timestamp;
      }
      // Always draw every frame for smooth animation
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [moveSnake, drawGame, speed]);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      const newCellSize = getDynamicCellSize();
      setCellSize(newCellSize);
      
      // Update canvas size
      if (canvasRef.current) {
        canvasRef.current.width = GRID_SIZE * newCellSize;
        canvasRef.current.height = GRID_SIZE * newCellSize;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-dark py-12">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-display text-gold text-shadow-gold mb-2">
          <span className="text-gold text-shadow-gold">&lt;</span>
          <span className="text-accent text-shadow-accent">the arcade</span>
          <span className="text-gold text-shadow-gold">/&gt;</span>
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-display">
            <span className="text-neonGreen text-shadow-neonGreen">Score: </span>
            <span className="text-gold text-shadow-gold">{gameState.score}</span>
          </div>
          <div className="text-2xl font-display text-cream text-shadow-cream animate-glow">
            neon snake
          </div>
          <div className="text-2xl font-display">
            <span className="text-neonGreen text-shadow-neonGreen">High Score: </span>
            <span className="text-gold text-shadow-gold">{highScore}</span>
          </div>
        </div>

        {/* Game Container with Border */}
        <div className="border-2 border-neonGreen shadow-neonGreen rounded-lg p-4 bg-dark/50 mb-4">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * cellSize}
            height={GRID_SIZE * cellSize}
            className="mx-auto"
            style={{
              width: `${GRID_SIZE * cellSize}px`,
              height: `${GRID_SIZE * cellSize}px`,
            }}
          />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            <div className="col-start-2">
              <button
                onClick={() => handleKeyPress({ key: 'ArrowUp', preventDefault: () => {} } as KeyboardEvent)}
                className="w-16 h-16 rounded-lg border-2 border-neonGreen shadow-neonGreen bg-dark/50 flex items-center justify-center"
              >
                <span className="transform rotate-0">▲</span>
              </button>
            </div>
            <div className="col-start-1">
              <button
                onClick={() => handleKeyPress({ key: 'ArrowLeft', preventDefault: () => {} } as KeyboardEvent)}
                className="w-16 h-16 rounded-lg border-2 border-neonGreen shadow-neonGreen bg-dark/50 flex items-center justify-center"
              >
                <span className="transform -rotate-90">▲</span>
              </button>
            </div>
            <div className="col-start-2">
              <button
                onClick={() => handleKeyPress({ key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent)}
                className="w-16 h-16 rounded-lg border-2 border-neonGreen shadow-neonGreen bg-dark/50 flex items-center justify-center"
              >
                <span className="transform rotate-180">▲</span>
              </button>
            </div>
            <div className="col-start-3">
              <button
                onClick={() => handleKeyPress({ key: 'ArrowRight', preventDefault: () => {} } as KeyboardEvent)}
                className="w-16 h-16 rounded-lg border-2 border-neonGreen shadow-neonGreen bg-dark/50 flex items-center justify-center"
              >
                <span className="transform rotate-90">▲</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => handleKeyPress({ key: ' ', preventDefault: () => {} } as KeyboardEvent)}
            className="w-full mt-4 py-3 rounded-lg border-2 border-gold shadow-gold bg-dark/50 text-gold"
          >
            {gameState.paused ? 'Resume' : 'Pause'}</button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4">
          {gameState.gameOver ? (
            <p className="text-xl font-display text-gold text-shadow-gold">
              Game Over! {window.innerWidth >= 768 ? 'Press Space or Enter' : 'Tap the button'} to restart
            </p>
          ) : gameState.paused ? (
            <p className="text-xl font-display text-gold text-shadow-gold">
              Paused - {window.innerWidth >= 768 ? 'Press Space' : 'Tap the button'} to continue
            </p>
          ) : (
            <p className="text-xl font-display text-neonGreen text-shadow-neonGreen">
              {window.innerWidth >= 768 ? 'Use arrow keys to move, Space to pause' : 'Use the D-pad to move'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
