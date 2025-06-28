/**
 * 闪电战机游戏主类
 * 负责管理整个游戏的状态、逻辑和渲染
 */
// ==================== 游戏状态管理 ====================
let gameState = {
    // 游戏状态
    currentState: 'start',
    
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
    lastMenuInput: 0,
    
    // 时间控制变量
    lastShot: 0,
    lastSpecialShot: 0,
    enemySpawnTimer: 0,
    levelStartTime: 0,
    levelElapsedTime: 0,
    
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
    loadLevelData();
    createPlayer();
    
    // 设置初始游戏状态
    gameState.currentState = 'start';
    
    // 开始游戏循环
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
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // 排行榜按钮点击事件
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', showLeaderboard);
    }
    
    // 重新开始按钮点击事件
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // 下一关按钮点击事件
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', nextLevel);
    }
    
    // 游戏通关重新开始按钮点击事件
    const gameCompleteRestartBtn = document.getElementById('gameCompleteRestartBtn');
    if (gameCompleteRestartBtn) {
        gameCompleteRestartBtn.addEventListener('click', restartGame);
    }
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
    switch (gameState.currentState) {
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
    if (gameState.currentState !== 'start') {
        restartGame();
    }
}

function handleMenuSpecial() {
    // 防止重复触发
    if (gameState.lastMenuInput && Date.now() - gameState.lastMenuInput < 300) return;
    gameState.lastMenuInput = Date.now();
    
    // 特殊功能：显示排行榜
    if (gameState.currentState === 'start') {
        showLeaderboard();
    }
}

// ==================== 玩家相关函数 ====================
function createPlayer() {
    gameState.player = {
        x: gameState.width / 2 - 20, // 居中显示
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
    if (gameState.currentState !== 'playing') return;
    
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
        1: { 
            name: "新手训练",
            enemies: ['fighter'], 
            spawnRate: 120, 
            enemySpeed: 0.8,
            enemyHealth: 30,
            enemyFireRate: 4000,
            levelDuration: 45000, // 45秒
            enemiesRequired: 15,
            powerUpChance: 0.15
        },
        2: { 
            name: "基础战斗",
            enemies: ['fighter', 'bomber'], 
            spawnRate: 110, 
            enemySpeed: 1.0,
            enemyHealth: 35,
            enemyFireRate: 3800,
            levelDuration: 50000, // 50秒
            enemiesRequired: 18,
            powerUpChance: 0.16
        },
        3: { 
            name: "火力升级",
            enemies: ['fighter', 'bomber', 'scout'], 
            spawnRate: 100, 
            enemySpeed: 1.2,
            enemyHealth: 40,
            enemyFireRate: 3600,
            levelDuration: 55000, // 55秒
            enemiesRequired: 20,
            powerUpChance: 0.17
        },
        4: { 
            name: "敌群来袭",
            enemies: ['fighter', 'bomber', 'scout'], 
            spawnRate: 95, 
            enemySpeed: 1.3,
            enemyHealth: 45,
            enemyFireRate: 3400,
            levelDuration: 60000, // 60秒
            enemiesRequired: 22,
            powerUpChance: 0.18
        },
        5: { 
            name: "第一关Boss",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor'], 
            spawnRate: 90, 
            enemySpeed: 1.4,
            enemyHealth: 50,
            enemyFireRate: 3200,
            levelDuration: 70000, // 70秒
            enemiesRequired: 25,
            powerUpChance: 0.20,
            hasBoss: true,
            bossHealth: 300
        },
        6: { 
            name: "进阶挑战",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship'], 
            spawnRate: 85, 
            enemySpeed: 1.5,
            enemyHealth: 55,
            enemyFireRate: 3000,
            levelDuration: 65000, // 65秒
            enemiesRequired: 28,
            powerUpChance: 0.21
        },
        7: { 
            name: "火力全开",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship'], 
            spawnRate: 80, 
            enemySpeed: 1.6,
            enemyHealth: 60,
            enemyFireRate: 2800,
            levelDuration: 70000, // 70秒
            enemiesRequired: 30,
            powerUpChance: 0.22
        },
        8: { 
            name: "精英部队",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer'], 
            spawnRate: 75, 
            enemySpeed: 1.7,
            enemyHealth: 65,
            enemyFireRate: 2600,
            levelDuration: 75000, // 75秒
            enemiesRequired: 32,
            powerUpChance: 0.23
        },
        9: { 
            name: "终极试炼",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier'], 
            spawnRate: 70, 
            enemySpeed: 1.8,
            enemyHealth: 70,
            enemyFireRate: 2400,
            levelDuration: 80000, // 80秒
            enemiesRequired: 35,
            powerUpChance: 0.25
        },
        10: { 
            name: "最终Boss",
            enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship'], 
            spawnRate: 65, 
            enemySpeed: 1.9,
            enemyHealth: 75,
            enemyFireRate: 2200,
            levelDuration: 90000, // 90秒
            enemiesRequired: 40,
            powerUpChance: 0.30,
            hasBoss: true,
            bossHealth: 500
        }
    };
}

// ==================== 游戏控制函数 ====================
function startGame() {
    console.log('开始游戏被调用');
    gameState.currentState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    console.log('开始界面已隐藏');
    startLevel(1);
    console.log('关卡1已开始');
}

function restartGame() {
    console.log('重新开始游戏被调用');
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 8;
    gameState.powerLevel = 1;
    gameState.currentState = 'playing';
    
    // 隐藏所有界面
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    document.getElementById('gameComplete').classList.add('hidden');
    document.getElementById('leaderboard').classList.add('hidden');
    document.getElementById('newRecord').classList.add('hidden');
    document.getElementById('finalScoreDialog').classList.add('hidden');
    
    startLevel(1);
}

function nextLevel() {
    gameState.level++;
    gameState.levelEnemiesKilled = 0;
    
    document.getElementById('levelComplete').classList.add('hidden');
    
    if (gameState.level <= 10) {
        gameState.currentState = 'playing';
        startLevel(gameState.level);
    } else {
        gameState.currentState = 'gameComplete';
        document.getElementById('gameComplete').classList.remove('hidden');
        // 处理排行榜
        handleGameEnd(gameState.score, gameState.level - 1);
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

// 游戏结束处理
function gameOver() {
    gameState.currentState = 'gameOver';
    document.getElementById('gameOver').classList.remove('hidden');
    // 处理排行榜
    handleGameEnd(gameState.score, gameState.level - 1);
}

// ==================== 游戏主循环 ====================
function gameLoop() {
    update();
    render();
    updateUI(); // 添加UI更新
    handleGamepadMenuInput(); // 添加手柄菜单输入处理
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.currentState !== 'playing') {
        // console.log('游戏状态不是playing:', gameState.currentState);
        return;
    }
    
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

function checkLevelComplete() {
    const currentLevelData = gameState.levelData[gameState.level];
    if (!currentLevelData) return;
    
    // 检查关卡时间
    if (!gameState.levelStartTime) {
        gameState.levelStartTime = Date.now();
    }
    
    gameState.levelElapsedTime = Date.now() - gameState.levelStartTime;
    
    // 检查是否完成关卡（时间到且敌人清空，或者击杀足够敌人）
    const timeComplete = gameState.levelElapsedTime >= currentLevelData.levelDuration;
    const enemiesComplete = gameState.levelEnemiesKilled >= currentLevelData.enemiesRequired;
    const noEnemiesLeft = gameState.enemies.length === 0;
    
    if ((timeComplete && noEnemiesLeft) || enemiesComplete) {
        if (gameState.level < 10) {
            gameState.currentState = 'levelComplete';
            document.getElementById('levelComplete').classList.remove('hidden');
        } else {
            // 游戏通关
            gameState.currentState = 'gameComplete';
            document.getElementById('gameComplete').classList.remove('hidden');
            // 处理排行榜
            handleGameEnd(gameState.score, gameState.level);
        }
    }
}

// 开始关卡
function startLevel(level) {
    gameState.level = level;
    gameState.levelStartTime = 0;
    gameState.levelElapsedTime = 0;
    gameState.enemies = [];
    gameState.bullets = [];
    gameState.enemyBullets = [];
    gameState.explosions = [];
    gameState.powerUps = [];
    gameState.enemySpawnTimer = 0;
    
    // 创建玩家
    createPlayer();
    
    // 显示关卡信息
    showLevelInfo(level);
}

// 显示关卡信息
function showLevelInfo(level) {
    const config = gameState.levelData[level];
    if (!config) return;
    
    const levelInfo = document.getElementById('levelInfo');
    const levelName = document.getElementById('levelName');
    const levelNumber = document.getElementById('levelNumber');
    
    levelName.textContent = config.name;
    levelNumber.textContent = level;
    
    levelInfo.classList.remove('hidden');
    
    // 3秒后隐藏
    setTimeout(() => {
        levelInfo.classList.add('hidden');
    }, 3000);
}

// ==================== 游戏启动 ====================
window.addEventListener('load', initGame); 