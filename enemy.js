// ==================== 敌人系统 ====================

// 敌人类型配置
const enemyTypes = {
    fighter: { width: 30, height: 25, health: 20, speed: 1.2, color: '#ff6b6b', points: 10, fireRate: 120 },
    bomber: { width: 35, height: 30, health: 30, speed: 0.8, color: '#ff8e8e', points: 15, fireRate: 100 },
    scout: { width: 25, height: 20, health: 15, speed: 1.8, color: '#ffa5a5', points: 8, fireRate: 80 },
    interceptor: { width: 32, height: 28, health: 25, speed: 1.5, color: '#ffb5b5', points: 12, fireRate: 90 },
    gunship: { width: 40, height: 35, health: 40, speed: 0.6, color: '#ffc5c5', points: 20, fireRate: 110 },
    destroyer: { width: 50, height: 40, health: 50, speed: 0.7, color: '#ffd5d5', points: 30, fireRate: 80 },
    carrier: { width: 60, height: 45, health: 60, speed: 0.5, color: '#ffe5e5', points: 50, fireRate: 90 },
    battleship: { width: 70, height: 55, health: 75, speed: 0.6, color: '#ffaaa5', points: 100, fireRate: 70 },
    dreadnought: { width: 80, height: 60, health: 100, speed: 0.5, color: '#ff8b94', points: 150, fireRate: 60 },
    titan: { width: 90, height: 65, health: 150, speed: 0.4, color: '#ff6b9d', points: 250, fireRate: 50 }
};

function createEnemy(type) {
    const config = enemyTypes[type];
    const currentLevel = gameState.levelData[gameState.level];
    
    if (!currentLevel) {
        return {
            x: Math.random() * (gameState.width - config.width),
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
            type: type
        };
    }
    
    const speedMultiplier = currentLevel.enemySpeed;
    
    return {
        x: Math.random() * (gameState.width - config.width),
        y: -config.height,
        width: config.width,
        height: config.height,
        health: config.health + (gameState.level - 1) * 5,
        maxHealth: config.health + (gameState.level - 1) * 5,
        speed: config.speed * speedMultiplier,
        color: config.color,
        points: config.points,
        fireRate: config.fireRate,
        lastShot: 0,
        type: type
    };
}

function spawnEnemy() {
    const currentLevel = gameState.levelData[gameState.level];
    if (!currentLevel) return;
    
    const enemyTypes = currentLevel.enemies;
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    gameState.enemies.push(createEnemy(randomType));
}

function spawnEnemies() {
    const currentLevel = gameState.levelData[gameState.level];
    if (!currentLevel) return;
    
    gameState.enemySpawnTimer++;
    
    if (gameState.enemySpawnTimer >= currentLevel.spawnRate) {
        spawnEnemy();
        gameState.enemySpawnTimer = 0;
    }
}

function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        enemy.y += enemy.speed;
        
        // 敌人射击
        const now = Date.now();
        if (now - enemy.lastShot > enemy.fireRate) {
            enemyShoot(enemy);
            enemy.lastShot = now;
        }
        
        // 移除超出屏幕的敌人
        if (enemy.y > gameState.height) {
            gameState.enemies.splice(i, 1);
        }
    }
}

function enemyShoot(enemy) {
    gameState.enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 8,
        speed: 4,
        color: '#ff6b6b',
        damage: 15
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