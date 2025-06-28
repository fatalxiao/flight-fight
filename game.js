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
    
    // 游戏对象数组
    player: null,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    explosions: [],
    powerUps: [],
    asteroids: [],
    
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
    
    // 设置画布为全屏尺寸
    resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化背景元素
    initBackgroundElements();
    
    // 初始化游戏
    setupEventListeners();
    loadLevelData();
    createPlayer();
    
    // 设置初始游戏状态
    gameState.currentState = 'start';
    
    // 开始游戏循环
    gameLoop();
}

// 调整画布尺寸
function resizeCanvas() {
    const canvas = gameState.canvas;
    const container = canvas.parentElement;
    
    // 获取容器尺寸
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // 设置画布尺寸
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // 更新游戏状态中的尺寸
    gameState.width = containerWidth;
    gameState.height = containerHeight;
    
    // 如果玩家已存在，重新定位玩家
    if (gameState.player) {
        gameState.player.x = gameState.width / 2 - gameState.player.width / 2;
        gameState.player.y = gameState.height - gameState.player.height - 50;
    }
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
        lives: 8,
        powerLevel: 1,
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
    if (now - gameState.lastShot > 150 - (gameState.player.powerLevel - 1) * 15) {
        const bulletWidth = 4;
        const bulletHeight = 18;
        const bulletSpeed = 10;
        const bulletDamage = 20 + (gameState.player.powerLevel - 1) * 10;
        
        if (gameState.player.powerLevel === 1) {
            gameState.bullets.push({
                x: gameState.player.x + gameState.player.width / 2 - bulletWidth / 2,
                y: gameState.player.y,
                width: bulletWidth,
                height: bulletHeight,
                speed: bulletSpeed,
                color: '#00ffff',
                damage: bulletDamage
            });
        } else if (gameState.player.powerLevel === 2) {
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
        } else if (gameState.player.powerLevel >= 3) {
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
    const bulletCount = Math.min(gameState.player.powerLevel * 2, 8); // 发射更多子弹
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
            damage: 40 + (gameState.player.powerLevel - 1) * 15,
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
            description: "学习基本操作",
            waves: 2,
            enemySpeed: 0.8,
            enemyHealth: 12,
            enemyFireRate: 180,
            powerUpChance: 0.3
        },
        2: {
            name: "基础战斗",
            description: "面对更多敌人",
            waves: 3,
            enemySpeed: 0.9,
            enemyHealth: 15,
            enemyFireRate: 160,
            powerUpChance: 0.3
        },
        3: {
            name: "空中威胁",
            description: "敌人开始编队",
            waves: 3,
            enemySpeed: 1.0,
            enemyHealth: 18,
            enemyFireRate: 150,
            powerUpChance: 0.25
        },
        4: {
            name: "密集攻击",
            description: "敌人数量增加",
            waves: 4,
            enemySpeed: 1.1,
            enemyHealth: 20,
            enemyFireRate: 140,
            powerUpChance: 0.25
        },
        5: {
            name: "精英来袭",
            description: "Boss战！",
            waves: 4,
            enemySpeed: 1.2,
            enemyHealth: 25,
            enemyFireRate: 130,
            powerUpChance: 0.2,
            hasBoss: true
        },
        6: {
            name: "空中要塞",
            description: "重型敌人出现",
            waves: 5,
            enemySpeed: 1.3,
            enemyHealth: 30,
            enemyFireRate: 120,
            powerUpChance: 0.2
        },
        7: {
            name: "舰队集结",
            description: "大规模编队",
            waves: 5,
            enemySpeed: 1.4,
            enemyHealth: 35,
            enemyFireRate: 110,
            powerUpChance: 0.15
        },
        8: {
            name: "终极威胁",
            description: "最强敌人",
            waves: 6,
            enemySpeed: 1.5,
            enemyHealth: 40,
            enemyFireRate: 100,
            powerUpChance: 0.15
        },
        9: {
            name: "最后防线",
            description: "突破极限",
            waves: 6,
            enemySpeed: 1.6,
            enemyHealth: 45,
            enemyFireRate: 90,
            powerUpChance: 0.1
        },
        10: {
            name: "最终决战",
            description: "终极Boss战！",
            waves: 7,
            enemySpeed: 1.7,
            enemyHealth: 50,
            enemyFireRate: 80,
            powerUpChance: 0.1,
            hasBoss: true
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
    gameState.currentWave = 0; // 重置波次
    
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
    if (gameState.currentState !== 'playing') return;
    
    // 更新玩家
    updatePlayer();
    
    // 更新敌人系统（波次系统）
    updateEnemySystem();
    
    // 更新小行星系统
    spawnAsteroid();
    updateAsteroids();
    
    // 更新子弹
    updateBullets();
    updateEnemyBullets();
    
    // 更新特效
    updateExplosions();
    updatePowerUps();
    
    // 碰撞检测
    checkCollisions();
    checkAsteroidBulletCollisions();
    checkAsteroidPlayerCollisions();
    
    // 检查关卡完成
    checkLevelComplete();
}

function checkLevelComplete() {
    // 检查是否完成足够的波次
    const currentLevel = gameState.levelData[gameState.level];
    if (!currentLevel) return;
    
    const requiredWaves = currentLevel.waves || 3; // 默认每关3波
    
    if (gameState.currentWave > requiredWaves && isWaveComplete()) {
        levelComplete();
    }
}

function levelComplete() {
    if (gameState.level === 10) {
        gameState.currentState = 'gameComplete';
        document.getElementById('finalScoreComplete').textContent = gameState.score;
        document.getElementById('gameComplete').classList.remove('hidden');
    } else {
        gameState.currentState = 'levelComplete';
        document.getElementById('currentScore').textContent = gameState.score;
        document.getElementById('levelComplete').classList.remove('hidden');
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
    gameState.asteroids = [];
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

// ==================== 小行星系统 ====================

// 小行星类型配置
const asteroidTypes = {
    small: { 
        size: 15, 
        health: 20, 
        speed: 0.8, 
        color: '#8B7355', 
        points: 50,
        damage: 10
    },
    medium: { 
        size: 25, 
        health: 35, 
        speed: 0.6, 
        color: '#654321', 
        points: 100,
        damage: 15
    },
    large: { 
        size: 35, 
        health: 50, 
        speed: 0.4, 
        color: '#4A4A4A', 
        points: 200,
        damage: 20
    }
};

// 创建小行星
function createAsteroid() {
    const types = Object.keys(asteroidTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const config = asteroidTypes[type];
    
    return {
        x: Math.random() * (gameState.width - config.size * 2) + config.size,
        y: -config.size,
        size: config.size,
        health: config.health,
        maxHealth: config.health,
        speed: config.speed,
        color: config.color,
        points: config.points,
        damage: config.damage,
        type: type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        movementPattern: Math.random() > 0.5 ? 'straight' : 'diagonal',
        diagonalDirection: Math.random() > 0.5 ? 1 : -1
    };
}

// 生成小行星
function spawnAsteroid() {
    if (Math.random() < 0.005) { // 0.5% 概率每帧生成小行星，减少陨石数量
        gameState.asteroids.push(createAsteroid());
    }
}

// 更新小行星
function updateAsteroids() {
    gameState.asteroids.forEach((asteroid, index) => {
        // 更新位置
        if (asteroid.movementPattern === 'straight') {
            asteroid.y += asteroid.speed;
        } else if (asteroid.movementPattern === 'diagonal') {
            asteroid.y += asteroid.speed;
            asteroid.x += asteroid.speed * 0.5 * asteroid.diagonalDirection;
        }
        
        // 更新旋转
        asteroid.rotation += asteroid.rotationSpeed;
        
        // 检查是否超出屏幕
        if (asteroid.y > gameState.height + asteroid.size) {
            gameState.asteroids.splice(index, 1);
        }
        
        // 检查是否碰到屏幕边界
        if (asteroid.x < asteroid.size) {
            asteroid.x = asteroid.size;
            asteroid.diagonalDirection = 1;
        } else if (asteroid.x > gameState.width - asteroid.size) {
            asteroid.x = gameState.width - asteroid.size;
            asteroid.diagonalDirection = -1;
        }
    });
}

// 检查小行星与子弹的碰撞
function checkAsteroidBulletCollisions() {
    gameState.bullets.forEach((bullet, bulletIndex) => {
        gameState.asteroids.forEach((asteroid, asteroidIndex) => {
            const dx = bullet.x + bullet.width / 2 - asteroid.x;
            const dy = bullet.y + bullet.height / 2 - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < asteroid.size + Math.max(bullet.width, bullet.height) / 2) {
                // 碰撞发生
                asteroid.health -= bullet.damage || 10;
                
                // 移除子弹
                gameState.bullets.splice(bulletIndex, 1);
                
                // 检查小行星是否被摧毁
                if (asteroid.health <= 0) {
                    // 增加分数
                    gameState.score += asteroid.points;
                    
                    // 创建爆炸效果
                    gameState.explosions.push({
                        x: asteroid.x,
                        y: asteroid.y,
                        life: 30,
                        maxLife: 30
                    });
                    
                    // 移除小行星
                    gameState.asteroids.splice(asteroidIndex, 1);
                }
            }
        });
    });
}

// 检查小行星与玩家的碰撞
function checkAsteroidPlayerCollisions() {
    if (!gameState.player) return;
    
    gameState.asteroids.forEach((asteroid, index) => {
        const dx = gameState.player.x + gameState.player.width / 2 - asteroid.x;
        const dy = gameState.player.y + gameState.player.height / 2 - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < asteroid.size + Math.max(gameState.player.width, gameState.player.height) / 2) {
            // 玩家受到伤害
            gameState.player.health -= asteroid.damage;
            
            // 创建爆炸效果
            gameState.explosions.push({
                x: asteroid.x,
                y: asteroid.y,
                life: 30,
                maxLife: 30
            });
            
            // 移除小行星
            gameState.asteroids.splice(index, 1);
            
            // 检查玩家是否死亡
            if (gameState.player.health <= 0) {
                gameOver();
            }
        }
    });
}

// ==================== 游戏启动 ====================
window.addEventListener('load', initGame); 