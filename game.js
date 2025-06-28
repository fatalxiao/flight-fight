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
    lives: 8,
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
    levelEnemiesRequired: 20,
    
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

// ==================== 手柄菜单控制 ====================
function handleGamepadMenuInput() {
    if (!gameState.gamepadConnected || !gameState.gamepad) return;
    
    // 更新手柄状态
    gameState.gamepad = navigator.getGamepads()[gameState.gamepad.index];
    if (!gameState.gamepad) return;
    
    // 手柄按钮映射
    const buttons = gameState.gamepad.buttons;
    
    // A键 (按钮0) - 确认/开始
    if (buttons[0]?.pressed) {
        handleMenuConfirm();
    }
    
    // B键 (按钮1) - 返回/取消
    if (buttons[1]?.pressed) {
        handleMenuCancel();
    }
    
    // X键 (按钮2) - 特殊功能
    if (buttons[2]?.pressed) {
        handleMenuSpecial();
    }
    
    // Y键 (按钮3) - 特殊功能
    if (buttons[3]?.pressed) {
        handleMenuSpecial();
    }
}

function handleMenuConfirm() {
    // 防止重复触发
    if (gameState.lastMenuInput && Date.now() - gameState.lastMenuInput < 300) return;
    gameState.lastMenuInput = Date.now();
    
    // 根据当前游戏状态执行相应操作
    switch (gameState.gameState) {
        case 'start':
            startGame();
            break;
        case 'gameOver':
            restartGame();
            break;
        case 'levelComplete':
            nextLevel();
            break;
        case 'gameComplete':
            restartGame();
            break;
    }
}

function handleMenuCancel() {
    // 防止重复触发
    if (gameState.lastMenuInput && Date.now() - gameState.lastMenuInput < 300) return;
    gameState.lastMenuInput = Date.now();
    
    // 返回开始界面
    if (gameState.gameState !== 'start') {
        restartGame();
    }
}

function handleMenuSpecial() {
    // 防止重复触发
    if (gameState.lastMenuInput && Date.now() - gameState.lastMenuInput < 300) return;
    gameState.lastMenuInput = Date.now();
    
    // 特殊功能：直接开始游戏
    if (gameState.gameState === 'start') {
        startGame();
    }
}

// ==================== 玩家相关函数 ====================
function createPlayer() {
    gameState.player = {
        x: gameState.width / 2,
        y: gameState.height - 80,
        width: 40,
        height: 40,
        speed: 6,
        health: 200,
        maxHealth: 200,
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
                moveX += leftStickX * gameState.player.speed * 0.8;
            }
            if (Math.abs(leftStickY) > deadzone) {
                moveY += leftStickY * gameState.player.speed * 0.8;
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
    if (now - gameState.lastShot > 150 - (gameState.powerLevel - 1) * 15) {
        const bulletWidth = 4;
        const bulletHeight = 18;
        const bulletSpeed = 10;
        const bulletDamage = 20 + (gameState.powerLevel - 1) * 10;
        
        if (gameState.powerLevel === 1) {
            gameState.bullets.push({
                x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2,
                y: gameState.player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: bulletSpeed,
                color: '#00ffff',
                damage: bulletDamage
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
            width: 5,
            height: 25,
            speed: 15,
            color: '#ff00ff',
            damage: 40 + (gameState.powerLevel - 1) * 15,
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
        1: { enemies: ['fighter', 'bomber'], spawnRate: 100, enemySpeed: 1.0 },
        2: { enemies: ['fighter', 'bomber', 'scout'], spawnRate: 95, enemySpeed: 1.1 },
        3: { enemies: ['fighter', 'bomber', 'scout', 'interceptor'], spawnRate: 90, enemySpeed: 1.2 },
        4: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship'], spawnRate: 85, enemySpeed: 1.3 },
        5: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer'], spawnRate: 80, enemySpeed: 1.4 },
        6: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier'], spawnRate: 75, enemySpeed: 1.5 },
        7: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship'], spawnRate: 70, enemySpeed: 1.6 },
        8: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought'], spawnRate: 65, enemySpeed: 1.7 },
        9: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], spawnRate: 60, enemySpeed: 1.8 },
        10: { enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], spawnRate: 55, enemySpeed: 1.9 },
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
    gameState.lives = 8;
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
    handleGamepadMenuInput(); // 添加手柄菜单输入处理
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