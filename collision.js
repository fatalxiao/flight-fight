// ==================== 碰撞检测系统 ====================

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    // 玩家子弹与敌人碰撞检测
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            if (isColliding(bullet, enemy)) {
                enemy.health -= bullet.damage || 15; // 修复：使用默认伤害值
                gameState.bullets.splice(i, 1);
                
                if (enemy.health <= 0) {
                    gameState.score += enemy.points;
                    gameState.levelEnemiesKilled++;
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    gameState.enemies.splice(j, 1);
                    
                    // 增加道具掉落概率从10%到25%
                    if (Math.random() < 0.25) {
                        // 随机选择道具类型：70%概率掉落火力升级，30%概率掉落HP回复
                        const isHealthPickup = Math.random() < 0.3;
                        gameState.powerUps.push({
                            x: enemy.x + enemy.width / 2 - 10,
                            y: enemy.y + enemy.height / 2,
                            width: 20,
                            height: 20,
                            type: isHealthPickup ? 'health' : 'power' // 添加道具类型
                        });
                    }
                }
                break;
            }
        }
    }
    
    // 敌人子弹与玩家碰撞检测
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        if (isColliding(bullet, gameState.player)) {
            gameState.player.health -= bullet.damage;
            gameState.enemyBullets.splice(i, 1);
            
            if (gameState.player.health <= 0) {
                gameState.lives--;
                gameState.player.health = gameState.player.maxHealth;
                
                if (gameState.lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // 玩家与敌人碰撞检测
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        if (isColliding(gameState.player, enemy)) {
            gameState.lives--;
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            gameState.enemies.splice(i, 1);
            
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    }
    
    // 玩家与道具碰撞检测
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        if (isColliding(gameState.player, powerUp)) {
            if (powerUp.type === 'health') {
                // HP回复道具：回复50点血量
                gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + 50);
            } else {
                // 火力升级道具
                gameState.powerLevel++;
            }
            gameState.powerUps.splice(i, 1);
        }
    }
}

// ==================== 特效系统 ====================

function createExplosion(x, y) {
    gameState.explosions.push({
        x: x,
        y: y,
        life: 10,
        maxLife: 10
    });
}

function updateExplosions() {
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const explosion = gameState.explosions[i];
        explosion.life--;
        
        if (explosion.life <= 0) {
            gameState.explosions.splice(i, 1);
        }
    }
}

function updatePowerUps() {
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        powerUp.y += 2;
        
        if (powerUp.y > gameState.height) {
            gameState.powerUps.splice(i, 1);
        }
    }
}

// ==================== 游戏状态检查 ====================

function checkLevelComplete() {
    if (gameState.levelEnemiesKilled >= gameState.levelEnemiesRequired) {
        levelComplete();
    }
}

function levelComplete() {
    if (gameState.level === 10) {
        gameState.gameState = 'gameComplete';
        document.getElementById('finalScoreComplete').textContent = gameState.score;
        document.getElementById('gameComplete').classList.remove('hidden');
    } else {
        gameState.gameState = 'levelComplete';
        document.getElementById('levelComplete').classList.remove('hidden');
    }
}

function gameOver() {
    gameState.gameState = 'gameOver';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
} 