/**
 * 闪电战机游戏主类
 * 负责管理整个游戏的状态、逻辑和渲染
 */
// ==================== 游戏状态管理 ====================
let gameState = {
    // 游戏状态
    gameState: 'start',
    
    // 游戏核心数据
    score: 0,
    level: 1,
    lives: 5,
    powerLevel: 1,
    
    // 游戏对象数组
    player: null,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    explosions: [],
    powerUps: [],
    
    // 输入控制
    keys: {},
    gamepad: null,
    gamepadConnected: false,
    
    // 时间控制变量
    lastShot: 0,
    lastSpecialShot: 0,
    enemySpawnTimer: 0,
    
    // 关卡进度
    levelEnemiesKilled: 0,
    levelEnemiesRequired: 30,
    
    // 画布相关
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // 关卡数据
    levelData: {}
};

// ==================== 初始化函数 ====================
function initGame() {
    // 获取画布和上下文
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.width = gameState.canvas.width;
    gameState.height = gameState.canvas.height;
    
    // 初始化游戏
    setupEventListeners();
    createPlayer();
    loadLevelData();
    gameLoop();
}

// ==================== 事件监听器 ====================
function setupEventListeners() {
    // 键盘按下事件监听
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.code] = true;
        if (e.code === 'Space') {
            e.preventDefault();
        }
    });
    
    // 键盘释放事件监听
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.code] = false;
    });
    
    // 手柄连接事件监听
    window.addEventListener('gamepadconnected', (e) => {
        console.log('手柄已连接:', e.gamepad);
        gameState.gamepadConnected = true;
        gameState.gamepad = e.gamepad;
    });
    
    // 手柄断开连接事件监听
    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('手柄已断开连接:', e.gamepad);
        gameState.gamepadConnected = false;
        gameState.gamepad = null;
    });
    
    // 开始游戏按钮点击事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    
    // 重新开始按钮点击事件
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // 下一关按钮点击事件
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    
    // 游戏通关重新开始按钮点击事件
    document.getElementById('gameCompleteRestartBtn').addEventListener('click', restartGame);
}

// ==================== 玩家相关函数 ====================
function createPlayer() {
    gameState.player = {
        x: gameState.width / 2,
        y: gameState.height - 80,
        width: 40,
        height: 40,
        speed: 5,
        health: 150,
        maxHealth: 150,
        color: '#4a90e2'
    };
}

function updatePlayer() {
    if (gameState.gameState !== 'playing') return;
    
    const currentLevelData = gameState.levelData[gameState.level];
    if (!currentLevelData) return;
    
    // 键盘控制
    let moveX = 0;
    let moveY = 0;
    
    if (gameState.keys['ArrowLeft'] || gameState.keys['KeyA']) {
        moveX -= gameState.player.speed;
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['KeyD']) {
        moveX += gameState.player.speed;
    }
    if (gameState.keys['ArrowUp'] || gameState.keys['KeyW']) {
        moveY -= gameState.player.speed;
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['KeyS']) {
        moveY += gameState.player.speed;
    }
    
    // 手柄控制
    if (gameState.gamepadConnected && gameState.gamepad) {
        gameState.gamepad = navigator.getGamepads()[gameState.gamepad.index];
        
        if (gameState.gamepad) {
            const leftStickX = gameState.gamepad.axes[0];
            const leftStickY = gameState.gamepad.axes[1];
            
            const deadzone = 0.1;
            if (Math.abs(leftStickX) > deadzone) {
                moveX += leftStickX * gameState.player.speed * 2;
            }
            if (Math.abs(leftStickY) > deadzone) {
                moveY += leftStickY * gameState.player.speed * 2;
            }
            
            // 十字键控制
            if (gameState.gamepad.buttons[14]?.pressed) moveX -= gameState.player.speed;
            if (gameState.gamepad.buttons[15]?.pressed) moveX += gameState.player.speed;
            if (gameState.gamepad.buttons[12]?.pressed) moveY -= gameState.player.speed;
            if (gameState.gamepad.buttons[13]?.pressed) moveY += gameState.player.speed;
        }
    }
    
    // 更新玩家位置
    gameState.player.x += moveX;
    gameState.player.y += moveY;
    
    // 边界检测
    gameState.player.x = Math.max(0, Math.min(gameState.width - gameState.player.width, gameState.player.x));
    gameState.player.y = Math.max(0, Math.min(gameState.height - gameState.player.height, gameState.player.y));
    
    // 自动射击
    shoot();
    
    // 特殊射击
    const currentTime = Date.now();
    const specialShotCooldown = 2000;
    
    let shouldSpecialShot = false;
    
    if (gameState.keys['Space']) {
        shouldSpecialShot = true;
    }
    
    if (gameState.gamepadConnected && gameState.gamepad && gameState.gamepad.buttons[7]?.pressed) {
        shouldSpecialShot = true;
    }
    
    if (shouldSpecialShot && currentTime - gameState.lastSpecialShot > specialShotCooldown) {
        specialShot();
        gameState.lastSpecialShot = currentTime;
    }
}

// ==================== 射击系统 ====================
function shoot() {
    const now = Date.now();
    if (now - gameState.lastShot > 200 - (gameState.powerLevel - 1) * 20) {
        const bulletWidth = 3;
        const bulletHeight = 15;
        const bulletSpeed = 8;
        const bulletDamage = 15 + (gameState.powerLevel - 1) * 8; // 修复：添加伤害属性
        
        if (gameState.powerLevel === 1) {
            gameState.bullets.push({
                x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2,
                y: gameState.player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: bulletSpeed,
                color: '#00ffff',
                damage: bulletDamage // 修复：添加伤害属性
            });
        } else if (gameState.powerLevel === 2) {
            gameState.bullets.push(
                {
                    x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2 - 5,
                    y: gameState.player.y,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: bulletSpeed,
                    color: '#00ffff',
                    damage: bulletDamage
                },
                {
                    x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2 + 5,
                    y: gameState.player.y,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: bulletSpeed,
                    color: '#00ffff',
                    damage: bulletDamage
                }
            );
        } else if (gameState.powerLevel >= 3) {
            gameState.bullets.push(
                {
                    x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2,
                    y: gameState.player.y,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: bulletSpeed,
                    color: '#00ffff',
                    damage: bulletDamage
                },
                {
                    x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2 - 8,
                    y: gameState.player.y + 5,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: bulletSpeed,
                    color: '#00ffff',
                    damage: bulletDamage
                },
                {
                    x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2 + 8,
                    y: gameState.player.y + 5,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: bulletSpeed,
                    color: '#00ffff',
                    damage: bulletDamage
                }
            );
        }
        
        gameState.lastShot = now;
    }
}

function specialShot() {
    // 修复：还原为加强型子弹而不是水平激光
    const bulletCount = Math.min(gameState.powerLevel * 2, 8); // 发射更多子弹
    const spread = (bulletCount - 1) * 8;
    
    for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1) / 2) * spread;
        gameState.bullets.push({
            x: gameState.player.x + gameState.player.width / 2 - 2 + offset,
            y: gameState.player.y,
            width: 4,
            height: 20, // 更长的子弹
            speed: 12, // 更快的速度
            color: '#ff00ff', // 特殊颜色
            damage: 30 + (gameState.powerLevel - 1) * 10, // 更高伤害
            isSpecial: true
        });
    }
}

function updateBullets() {
    gameState.bullets = gameState.bullets.filter(bullet => {
        if (bullet.isSpecial) {
            // 特殊子弹处理
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        } else {
            // 普通子弹处理
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        }
    });
}

// ==================== 关卡系统 ====================
function loadLevelData() {
    gameState.levelData = {
        1: { enemies: ['fighter', 'bomber', 'scout'], spawnRate: 80, enemySpeed: 1.5 },
        2: { enemies: ['fighter', 'bomber', 'scout', 'interceptor'], spawnRate: 75, enemySpeed: 1.6 },
        3: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship'], spawnRate: 70, enemySpeed: 1.7 },
        4: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer'], spawnRate: 65, enemySpeed: 1.8 },
        5: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier'], spawnRate: 60, enemySpeed: 1.9 },
        6: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship'], spawnRate: 55, enemySpeed: 2.0 },
        7: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought'], spawnRate: 50, enemySpeed: 2.1 },
        8: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], spawnRate: 45, enemySpeed: 2.2 },
        9: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], spawnRate: 40, enemySpeed: 2.3 },
        10: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], spawnRate: 35, enemySpeed: 2.5 },
        11: { enemies: ['fighter'], spawnRate: 1000, enemySpeed: 1.0 }
    };
}

// ==================== 游戏控制函数 ====================
function startGame() {
    gameState.gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    resetLevel();
}

function restartGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 5;
    gameState.powerLevel = 1;
    gameState.gameState = 'playing';
    
    // 隐藏所有界面
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    document.getElementById('gameComplete').classList.add('hidden');
    
    resetLevel();
}

function nextLevel() {
    gameState.level++;
    gameState.levelEnemiesKilled = 0;
    
    document.getElementById('levelComplete').classList.add('hidden');
    
    if (gameState.level <= 10) {
        gameState.gameState = 'playing';
        resetLevel();
    } else {
        gameState.gameState = 'gameComplete';
        document.getElementById('gameComplete').classList.remove('hidden');
    }
}

function resetLevel() {
    gameState.enemies = [];
    gameState.bullets = [];
    gameState.enemyBullets = [];
    gameState.explosions = [];
    gameState.powerUps = [];
    gameState.enemySpawnTimer = 0;
    createPlayer();
}

// ==================== 游戏主循环 ====================
function gameLoop() {
    update();
    render();
    updateUI();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.gameState !== 'playing') return;
    
    updatePlayer();
    updateEnemies();
    updateBullets();
    updateEnemyBullets();
    updateExplosions();
    updatePowerUps();
    checkCollisions();
    spawnEnemies();
    checkLevelComplete();
}

// ==================== 游戏启动 ====================
window.addEventListener('load', initGame); 