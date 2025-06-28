// ==================== 敌人系统 ====================

// 敌人类型配置 - 降低难度
const enemyTypes = {
    fighter: { width: 30, height: 25, health: 15, speed: 1.0, color: '#ff6b6b', points: 10, fireRate: 150 },
    bomber: { width: 35, height: 30, health: 20, speed: 0.6, color: '#ff8e8e', points: 15, fireRate: 120 },
    scout: { width: 25, height: 20, health: 10, speed: 1.4, color: '#ffa5a5', points: 8, fireRate: 100 },
    interceptor: { width: 32, height: 28, health: 18, speed: 1.2, color: '#ffb5b5', points: 12, fireRate: 110 },
    gunship: { width: 40, height: 35, health: 25, speed: 0.5, color: '#ffc5c5', points: 20, fireRate: 130 },
    destroyer: { width: 50, height: 40, health: 35, speed: 0.6, color: '#ffd5d5', points: 30, fireRate: 100 },
    carrier: { width: 60, height: 45, health: 45, speed: 0.4, color: '#ffe5e5', points: 50, fireRate: 110 },
    battleship: { width: 70, height: 55, health: 55, speed: 0.5, color: '#ffaaa5', points: 100, fireRate: 90 },
    dreadnought: { width: 80, height: 60, health: 70, speed: 0.4, color: '#ff8b94', points: 150, fireRate: 80 },
    titan: { width: 90, height: 65, health: 100, speed: 0.3, color: '#ff6b9d', points: 250, fireRate: 70 }
};

// 运动轨迹类型
const movementPatterns = {
    straight: 'straight',           // 直线下降
    leftToRight: 'leftToRight',     // 从左到右
    rightToLeft: 'rightToLeft',     // 从右到左
    diagonalLR: 'diagonalLR',       // 左上到右下
    diagonalRL: 'diagonalRL',       // 右上到左下
    circle: 'circle',               // 圆弧运动
    uTurn: 'uTurn',                 // U型转弯
    zigzag: 'zigzag',               // 之字形
    spiral: 'spiral',               // 螺旋运动
    wave: 'wave'                    // 波浪运动
};

// 编队类型
const formationTypes = {
    line: 'line',                   // 直线编队
    vShape: 'vShape',               // V字形编队
    diamond: 'diamond',             // 菱形编队
    circle: 'circle',               // 圆形编队
    square: 'square',               // 方形编队
    triangle: 'triangle',           // 三角形编队
    random: 'random'                // 随机编队
};

// 波次配置
const waveConfigs = {
    1: { enemies: 20, formations: 3, enemyTypes: ['fighter', 'scout'] },
    2: { enemies: 25, formations: 3, enemyTypes: ['fighter', 'scout', 'bomber'] },
    3: { enemies: 30, formations: 4, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor'] },
    4: { enemies: 35, formations: 4, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship'] },
    5: { enemies: 40, formations: 5, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer'] },
    6: { enemies: 45, formations: 5, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer', 'carrier'] },
    7: { enemies: 50, formations: 6, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship'] },
    8: { enemies: 55, formations: 6, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought'] },
    9: { enemies: 60, formations: 7, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought'] },
    10: { enemies: 65, formations: 7, enemyTypes: ['fighter', 'scout', 'bomber', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'] }
};

function createEnemy(type) {
    const config = enemyTypes[type];
    const currentLevel = gameState.levelData[gameState.level];
    
    if (!currentLevel) {
        return {
            x: gameState.width / 2 - config.width / 2 + (Math.random() - 0.5) * 100, // 在屏幕中央附近生成
            y: -config.height,
            width: config.width,
            height: config.height,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed,
            color: config.color,
            points: config.points,
            fireRate: config.fireRate,
            lastShot: 0,
            type: type,
            movementPattern: getRandomMovementPattern(),
            movementData: initializeMovementData()
        };
    }
    
    // 使用关卡配置中的敌人属性
    const health = currentLevel.enemyHealth || config.health;
    const speed = config.speed * currentLevel.enemySpeed;
    const fireRate = currentLevel.enemyFireRate || config.fireRate;
    
    return {
        x: gameState.width / 2 - config.width / 2 + (Math.random() - 0.5) * 100, // 在屏幕中央附近生成
        y: -config.height,
        width: config.width,
        height: config.height,
        health: health,
        maxHealth: health,
        speed: speed,
        color: config.color,
        points: config.points,
        fireRate: fireRate,
        lastShot: 0,
        type: type,
        movementPattern: getRandomMovementPattern(),
        movementData: initializeMovementData()
    };
}

// 获取随机运动轨迹
function getRandomMovementPattern() {
    const patterns = Object.values(movementPatterns);
    return patterns[Math.floor(Math.random() * patterns.length)];
}

// 初始化运动数据
function initializeMovementData() {
    return {
        angle: 0,
        radius: 50 + Math.random() * 100,
        centerX: 0,
        centerY: 0,
        startX: 0,
        startY: 0,
        direction: Math.random() > 0.5 ? 1 : -1,
        amplitude: 30 + Math.random() * 40,
        frequency: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
    };
}

// 生成正态分布的随机数
function normalRandom(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
}

// 限制在指定范围内的正态分布随机数
function clampedNormalRandom(mean, stdDev, min, max) {
    let value;
    do {
        value = normalRandom(mean, stdDev);
    } while (value < min || value > max);
    return value;
}

// 创建编队
function createFormation(formationType, enemyType, count, startX, startY) {
    const enemies = [];
    const spacing = 40;
    
    switch (formationType) {
        case formationTypes.line:
            // 直线编队 - 使用屏幕中央
            const lineCenterX = gameState.width / 2;
            for (let i = 0; i < count; i++) {
                const enemy = createEnemy(enemyType);
                enemy.x = lineCenterX + (i - count/2) * spacing;
                enemy.y = startY;
                enemies.push(enemy);
            }
            break;
            
        case formationTypes.vShape:
            // V字形编队 - 使用屏幕中央
            const vCenterX = gameState.width / 2;
            for (let i = 0; i < count; i++) {
                const enemy = createEnemy(enemyType);
                const offset = Math.floor(i / 2) * spacing;
                const side = i % 2 === 0 ? 1 : -1;
                enemy.x = vCenterX + side * offset;
                enemy.y = startY + Math.floor(i / 2) * spacing;
                enemies.push(enemy);
            }
            break;
            
        case formationTypes.diamond:
            // 菱形编队 - 使用屏幕中央
            const diamondCenterX = gameState.width / 2;
            const positions = [
                [0, 0], [1, 1], [2, 0], [1, -1]
            ];
            for (let i = 0; i < Math.min(count, 4); i++) {
                const enemy = createEnemy(enemyType);
                enemy.x = diamondCenterX + (positions[i][0] - 1) * spacing;
                enemy.y = startY + positions[i][1] * spacing;
                enemies.push(enemy);
            }
            break;
            
        case formationTypes.circle:
            // 圆形编队 - 使用屏幕中央
            const circleCenterX = gameState.width / 2;
            for (let i = 0; i < count; i++) {
                const enemy = createEnemy(enemyType);
                const angle = (i / count) * Math.PI * 2;
                const radius = 60;
                enemy.x = circleCenterX + Math.cos(angle) * radius;
                enemy.y = startY + Math.sin(angle) * radius;
                enemies.push(enemy);
            }
            break;
            
        case formationTypes.square:
            // 方形编队 - 中心位置使用正态分布
            const squareCenterX = clampedNormalRandom(gameState.width / 2, gameState.width / 6, 100, gameState.width - 100);
            const sideLength = Math.ceil(Math.sqrt(count));
            for (let i = 0; i < count; i++) {
                const enemy = createEnemy(enemyType);
                const row = Math.floor(i / sideLength);
                const col = i % sideLength;
                enemy.x = squareCenterX + (col - sideLength/2) * spacing;
                enemy.y = startY + (row - sideLength/2) * spacing;
                enemies.push(enemy);
            }
            break;
            
        case formationTypes.triangle:
            // 三角形编队 - 中心位置使用正态分布
            const triangleCenterX = clampedNormalRandom(gameState.width / 2, gameState.width / 6, 100, gameState.width - 100);
            let index = 0;
            for (let row = 0; row < 4 && index < count; row++) {
                for (let col = 0; col <= row && index < count; col++) {
                    const enemy = createEnemy(enemyType);
                    enemy.x = triangleCenterX + (col - row / 2) * spacing;
                    enemy.y = startY + row * spacing;
                    enemies.push(enemy);
                    index++;
                }
            }
            break;
            
        default: // random
            // 随机编队 - 每个敌人位置都使用正态分布
            for (let i = 0; i < count; i++) {
                const enemy = createEnemy(enemyType);
                enemy.x = clampedNormalRandom(gameState.width / 2, gameState.width / 4, 50, gameState.width - 50);
                enemy.y = startY + (Math.random() - 0.5) * 100;
                enemies.push(enemy);
            }
            break;
    }
    
    return enemies;
}

// 生成波次敌人
function generateWave(waveNumber) {
    const waveConfig = waveConfigs[waveNumber] || waveConfigs[1];
    const enemies = [];
    const formations = waveConfig.formations;
    const enemiesPerFormation = Math.ceil(waveConfig.enemies / formations);
    
    for (let i = 0; i < formations; i++) {
        const formationType = Object.values(formationTypes)[Math.floor(Math.random() * Object.values(formationTypes).length)];
        const enemyType = waveConfig.enemyTypes[Math.floor(Math.random() * waveConfig.enemyTypes.length)];
        const count = Math.min(enemiesPerFormation, waveConfig.enemies - enemies.length);
        
        // 为每个编队设置不同的起始位置，使用正态分布
        const startX = clampedNormalRandom(gameState.width / 2, gameState.width / 6, 100, gameState.width - 100);
        const startY = -100 - i * 50;
        
        const formationEnemies = createFormation(formationType, enemyType, count, startX, startY);
        enemies.push(...formationEnemies);
    }
    
    return enemies;
}

// 开始新波次
function startNewWave() {
    if (!gameState.currentWave) {
        gameState.currentWave = 1;
    } else {
        gameState.currentWave++;
    }
    
    gameState.waveEnemies = generateWave(gameState.currentWave);
    gameState.waveEnemiesSpawned = 0;
    gameState.waveSpawnTimer = 0;
    gameState.waveSpawnInterval = 30; // 每30帧生成一个敌人
}

// 生成波次敌人
function spawnWaveEnemies() {
    if (!gameState.waveEnemies || gameState.waveEnemiesSpawned >= gameState.waveEnemies.length) {
        return false; // 波次完成
    }
    
    gameState.waveSpawnTimer++;
    
    if (gameState.waveSpawnTimer >= gameState.waveSpawnInterval) {
        const enemy = gameState.waveEnemies[gameState.waveEnemiesSpawned];
        gameState.enemies.push(enemy);
        gameState.waveEnemiesSpawned++;
        gameState.waveSpawnTimer = 0;
    }
    
    return true; // 波次进行中
}

// 检查波次是否完成
function isWaveComplete() {
    return gameState.enemies.length === 0 && 
           (!gameState.waveEnemies || gameState.waveEnemiesSpawned >= gameState.waveEnemies.length);
}

// 更新敌人系统
function updateEnemySystem() {
    // 如果没有活跃的波次，开始新波次
    if (!gameState.waveEnemies || gameState.waveEnemiesSpawned >= gameState.waveEnemies.length) {
        if (gameState.enemies.length === 0) {
            startNewWave();
        }
    }
    
    // 生成波次敌人
    spawnWaveEnemies();
    
    // 更新现有敌人
    updateEnemies();
}

function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        // 更新敌机位置
        updateEnemyMovement(enemy);
        
        // 敌人射击
        const now = Date.now();
        if (now - enemy.lastShot > enemy.fireRate) {
            enemyShoot(enemy);
            enemy.lastShot = now;
        }
        
        // 移除超出屏幕的敌人
        if (isEnemyOutOfBounds(enemy)) {
            gameState.enemies.splice(i, 1);
        }
    }
}

// 更新敌机运动
function updateEnemyMovement(enemy) {
    const data = enemy.movementData;
    
    switch (enemy.movementPattern) {
        case movementPatterns.straight:
            enemy.y += enemy.speed;
            break;
            
        case movementPatterns.leftToRight:
            enemy.x += enemy.speed * 1.5;
            enemy.y += enemy.speed * 0.3;
            break;
            
        case movementPatterns.rightToLeft:
            enemy.x -= enemy.speed * 1.5;
            enemy.y += enemy.speed * 0.3;
            break;
            
        case movementPatterns.diagonalLR:
            enemy.x += enemy.speed * 0.8;
            enemy.y += enemy.speed * 0.8;
            break;
            
        case movementPatterns.diagonalRL:
            enemy.x -= enemy.speed * 0.8;
            enemy.y += enemy.speed * 0.8;
            break;
            
        case movementPatterns.circle:
            data.angle += 0.05;
            enemy.x = data.centerX + Math.cos(data.angle) * data.radius;
            enemy.y = data.centerY + Math.sin(data.angle) * data.radius;
            data.centerY += enemy.speed * 0.3;
            break;
            
        case movementPatterns.uTurn:
            const progress = (enemy.y - data.startY) / (gameState.height * 0.6);
            if (progress < 0.5) {
                // 下降阶段
                enemy.y += enemy.speed;
                enemy.x += data.direction * enemy.speed * 0.5;
            } else {
                // 上升阶段
                enemy.y -= enemy.speed * 0.8;
                enemy.x += data.direction * enemy.speed * 0.5;
            }
            break;
            
        case movementPatterns.zigzag:
            enemy.y += enemy.speed;
            enemy.x = data.startX + Math.sin(enemy.y * 0.02) * data.amplitude;
            break;
            
        case movementPatterns.spiral:
            data.angle += 0.08;
            const spiralRadius = data.radius * (1 - enemy.y / gameState.height);
            enemy.x = data.centerX + Math.cos(data.angle) * spiralRadius;
            enemy.y += enemy.speed * 0.5;
            break;
            
        case movementPatterns.wave:
            enemy.y += enemy.speed;
            enemy.x = data.startX + Math.sin(enemy.y * data.frequency + data.phase) * data.amplitude;
            break;
    }
}

// 检查敌机是否超出边界
function isEnemyOutOfBounds(enemy) {
    const margin = 50;
    return enemy.y > gameState.height + margin ||
           enemy.x < -enemy.width - margin ||
           enemy.x > gameState.width + margin ||
           enemy.y < -enemy.height - margin;
}

function enemyShoot(enemy) {
    gameState.enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2,
        y: enemy.y + enemy.height,
        width: 3,
        height: 6,
        speed: 3,
        color: '#ff6b6b',
        damage: 10
    });
}

function updateEnemyBullets() {
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        bullet.y += bullet.speed;
        
        if (bullet.y > gameState.height) {
            gameState.enemyBullets.splice(i, 1);
        }
    }
} 