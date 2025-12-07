/*
 * Cellular Automata Background
 * Conway's Game of Life for background + Red automata at mouse cursor
 */

(function() {
    'use strict';

    // Configuration
    const CELL_SIZE = 8; // Size of each cell in pixels
    const BG_OPACITY = 0.3; // Background automata opacity (low: 0.1-0.3)
    const RED_OPACITY = 0.6; // Red automata opacity
    const UPDATE_INTERVAL = 100; // Milliseconds between Game of Life updates
    const RED_FADE_STEPS = 15; // Number of steps for red cells to fade out
    let RED_USE_GAME_OF_LIFE = false; // Set to true for Conway's Game of Life, false for fading automata (toggleable via clicking "games")

    let canvas, ctx;
    let width, height;
    let cols, rows;
    let grid = []; // Current state
    let nextGrid = []; // Next state
    let redCells = new Map(); // Map of red cells: key = "x,y", value = {age, maxAge} (for fading mode)
    let redGrid = []; // Red cells current state (for Game of Life mode)
    let redNextGrid = []; // Red cells next state (for Game of Life mode)
    let lastUpdate = 0;
    let lastRedUpdate = 0;
    let animationId = null;
    let mouseX = 0, mouseY = 0;
    let isMouseMoving = false;

    // Initialize
    function init() {
        canvas = document.getElementById('cellular-automata-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        resizeCanvas();
        initializeGrid();
        startAnimation();
        setupEventListeners();
    }

    // Resize canvas to match main content area
    function resizeCanvas() {
        const main = document.getElementById('main');
        if (!main) return;

        width = window.innerWidth;
        // Use document height to cover full page
        height = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight);
        
        // Position canvas to cover main area
        const header = document.getElementById('header');
        let headerWidth = 0;
        let canvasLeft = 0;
        
        if (header) {
            const headerStyle = window.getComputedStyle(header);
            // Check if header is fixed (desktop) or relative (mobile)
            if (headerStyle.position === 'fixed') {
                headerWidth = header.offsetWidth;
                canvasLeft = headerWidth;
            } else {
                // Header is relative on mobile, canvas covers full width
                headerWidth = 0;
                canvasLeft = 0;
            }
        }
        
        canvas.width = width - headerWidth;
        canvas.height = height;
        canvas.style.left = canvasLeft + 'px';
        canvas.style.top = '0px';  // Start at top of page

        cols = Math.floor(canvas.width / CELL_SIZE);
        rows = Math.floor(canvas.height / CELL_SIZE);

        // Reinitialize grid with new dimensions
        initializeGrid();
    }

    // Initialize Game of Life grid with random pattern
    function initializeGrid() {
        grid = [];
        nextGrid = [];

        for (let y = 0; y < rows; y++) {
            grid[y] = [];
            nextGrid[y] = [];
            for (let x = 0; x < cols; x++) {
                // Random initial state (about 20% alive)
                grid[y][x] = Math.random() < 0.2 ? 1 : 0;
                nextGrid[y][x] = 0;
            }
        }

        // Initialize red grids if using Game of Life mode
        if (RED_USE_GAME_OF_LIFE) {
            redGrid = [];
            redNextGrid = [];
            for (let y = 0; y < rows; y++) {
                redGrid[y] = [];
                redNextGrid[y] = [];
                for (let x = 0; x < cols; x++) {
                    redGrid[y][x] = 0;
                    redNextGrid[y][x] = 0;
                }
            }
        } else {
            // Clear red cells map for fading mode
            redCells.clear();
        }
    }

    // Count live neighbors for Conway's Game of Life
    function countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    count += grid[ny][nx];
                }
            }
        }
        return count;
    }

    // Update Game of Life grid
    function updateGameOfLife() {
        const now = Date.now();
        if (now - lastUpdate < UPDATE_INTERVAL) return;
        lastUpdate = now;

        // Compute next generation
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const neighbors = countNeighbors(x, y);
                const current = grid[y][x];

                // Conway's Game of Life rules
                if (current === 1) {
                    // Live cell
                    if (neighbors < 2 || neighbors > 3) {
                        nextGrid[y][x] = 0; // Dies
                    } else {
                        nextGrid[y][x] = 1; // Survives
                    }
                } else {
                    // Dead cell
                    if (neighbors === 3) {
                        nextGrid[y][x] = 1; // Becomes alive
                    } else {
                        nextGrid[y][x] = 0; // Stays dead
                    }
                }
            }
        }

        // Swap grids
        const temp = grid;
        grid = nextGrid;
        nextGrid = temp;
    }

    // Count live neighbors for red cells (Game of Life mode)
    function countRedNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    count += redGrid[ny][nx];
                }
            }
        }
        return count;
    }

    // Update red Game of Life grid
    function updateRedGameOfLife() {
        const now = Date.now();
        if (now - lastRedUpdate < UPDATE_INTERVAL) return;
        lastRedUpdate = now;

        // Compute next generation for red cells
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const neighbors = countRedNeighbors(x, y);
                const current = redGrid[y][x];

                // Conway's Game of Life rules
                if (current === 1) {
                    // Live cell
                    if (neighbors < 2 || neighbors > 3) {
                        redNextGrid[y][x] = 0; // Dies
                    } else {
                        redNextGrid[y][x] = 1; // Survives
                    }
                } else {
                    // Dead cell
                    if (neighbors === 3) {
                        redNextGrid[y][x] = 1; // Becomes alive
                    } else {
                        redNextGrid[y][x] = 0; // Stays dead
                    }
                }
            }
        }

        // Swap grids
        const temp = redGrid;
        redGrid = redNextGrid;
        redNextGrid = temp;
    }

    // Update red cells (simpler pattern - expanding and fading)
    function updateRedCellsFading() {
        const newRedCells = new Map();

        redCells.forEach((cell, key) => {
            cell.age++;
            if (cell.age < cell.maxAge) {
                newRedCells.set(key, cell);
            }
        });

        redCells = newRedCells;
    }

    // Update red cells based on mode
    function updateRedCells() {
        if (RED_USE_GAME_OF_LIFE) {
            updateRedGameOfLife();
        } else {
            updateRedCellsFading();
        }
    }

    // Spawn red cells at mouse position
    function spawnRedCells(x, y) {
        // Get canvas position and size relative to viewport
        const canvasRect = canvas.getBoundingClientRect();
        
        // Calculate scale factor between canvas internal resolution and displayed size
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        
        // Convert viewport coordinates to canvas coordinates (accounting for scale and scroll)
        // When using absolute positioning, canvas is at top of document, so we need to account for scroll
        // canvasRect.top gives position relative to viewport, so we add scrollY to get document position
        const canvasX = (x - canvasRect.left) * scaleX;
        const canvasY = (y - canvasRect.top + window.scrollY) * scaleY;

        // Convert to grid coordinates
        const gridX = Math.floor(canvasX / CELL_SIZE);
        const gridY = Math.floor(canvasY / CELL_SIZE);

        if (RED_USE_GAME_OF_LIFE) {
            // Spawn a small Game of Life pattern (e.g., a glider or small cluster)
            const pattern = [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ]; // Simple 3x3 pattern
            
            const offsetX = Math.floor(pattern[0].length / 2);
            const offsetY = Math.floor(pattern.length / 2);
            
            for (let dy = 0; dy < pattern.length; dy++) {
                for (let dx = 0; dx < pattern[dy].length; dx++) {
                    const nx = gridX + dx - offsetX;
                    const ny = gridY + dy - offsetY;
                    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                        if (pattern[dy][dx] === 1) {
                            redGrid[ny][nx] = 1;
                        }
                    }
                }
            }
        } else {
            // Spawn a small pattern around mouse (fading mode)
            const radius = 3;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= radius) {
                        const nx = gridX + dx;
                        const ny = gridY + dy;
                        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                            const key = `${nx},${ny}`;
                            // Only spawn if not already a red cell or if it's older
                            if (!redCells.has(key) || redCells.get(key).age > 5) {
                                redCells.set(key, {
                                    age: 0,
                                    maxAge: RED_FADE_STEPS
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    // Render the canvas
    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background Game of Life cells
        ctx.fillStyle = `rgba(255, 255, 255, ${BG_OPACITY})`;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y][x] === 1) {
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // Draw red cells based on mode
        if (RED_USE_GAME_OF_LIFE) {
            // Draw red Game of Life cells
            // ctx.fillStyle = `rgba(255, 0, 0, ${RED_OPACITY})`; // red
            ctx.fillStyle = `rgba(162, 162, 162, ${RED_OPACITY})`; // grey
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (redGrid[y][x] === 1) {
                        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    }
                }
            }
        } else {
            // Draw red fading cells
            redCells.forEach((cell, key) => {
                const [x, y] = key.split(',').map(Number);
                const alpha = (1 - cell.age / cell.maxAge) * RED_OPACITY;
                // ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`; // red                
                ctx.fillStyle = `rgba(162, 162, 162, ${alpha})`; // grey
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        }
    }

    // Animation loop
    function animate() {
        updateGameOfLife();
        updateRedCells();
        
        // Spawn red cells if mouse is moving
        if (isMouseMoving) {
            spawnRedCells(mouseX, mouseY);
            isMouseMoving = false;
        }

        render();
        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    function startAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animate();
    }

    // Event listeners
    function setupEventListeners() {
        // Mouse move
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseMoving = true;
        });

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                resizeCanvas();
            }, 100);
        });

        // Update canvas height on scroll (if content grows)
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const newHeight = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight);
                if (newHeight !== height) {
                    resizeCanvas();
                }
            }, 100);
        });

        // Handle breakpoint changes (header width changes)
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(max-width: 1280px)');
            mediaQuery.addListener(function() {
                setTimeout(resizeCanvas, 100);
            });
        }

        // Toggle red automata mode when clicking "games"
        const gamesToggle = document.getElementById('games-toggle');
        if (gamesToggle) {
            gamesToggle.addEventListener('click', function() {
                RED_USE_GAME_OF_LIFE = !RED_USE_GAME_OF_LIFE;
                // Reinitialize grid to switch modes
                initializeGrid();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

