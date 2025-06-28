// ==================== 渲染系统 ====================

function render() {
    // 清空画布
    gameState.ctx.fillStyle = 'rgba(12, 20, 69, 0.1)';
    gameState.ctx.fillRect(0, 0, gameState.width, gameState.height);
    
    // 绘制背景星星
    drawStars();
    
    // 绘制游戏对象
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawExplosions();
    drawPowerUps();
    drawHealthBar();
}

function drawStars() {
    gameState.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % gameState.width;
        const y = (i * 73 + Date.now() * 0.01) % gameState.height;
        gameState.ctx.fillRect(x, y, 1, 1);
    }
}

function drawPlayer() {
    const x = gameState.player.x + gameState.player.width / 2;
    const y = gameState.player.y + gameState.player.height;
    const size = gameState.player.width / 2;
    
    // 绘制飞机主体
    gameState.ctx.fillStyle = gameState.player.color;
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(x, y - gameState.player.height);
    gameState.ctx.lineTo(x - size, y);
    gameState.ctx.lineTo(x + size, y);
    gameState.ctx.closePath();
    gameState.ctx.fill();
    
    // 绘制飞机细节
    gameState.ctx.fillStyle = '#ffffff';
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(x, y - gameState.player.height + 5);
    gameState.ctx.lineTo(x - size + 5, y - 5);
    gameState.ctx.lineTo(x + size - 5, y - 5);
    gameState.ctx.closePath();
    gameState.ctx.fill();
    
    // 绘制飞机引擎
    gameState.ctx.fillStyle = '#ff6b6b';
    gameState.ctx.fillRect(x - 3, y - 8, 6, 8);
}

function drawEnemies() {
    gameState.enemies.forEach(enemy => {
        const x = enemy.x + enemy.width / 2;
        const y = enemy.y;
        const size = enemy.width / 2;
        
        // 绘制敌人飞机主体
        gameState.ctx.fillStyle = enemy.color;
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x, y + enemy.height);
        gameState.ctx.lineTo(x - size, y);
        gameState.ctx.lineTo(x + size, y);
        gameState.ctx.closePath();
        gameState.ctx.fill();
        
        // 绘制敌人飞机细节
        gameState.ctx.fillStyle = '#ffffff';
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x, y + enemy.height - 5);
        gameState.ctx.lineTo(x - size + 5, y + 5);
        gameState.ctx.lineTo(x + size - 5, y + 5);
        gameState.ctx.closePath();
        gameState.ctx.fill();
        
        // 绘制敌人血条
        const healthPercent = enemy.health / enemy.maxHealth;
        gameState.ctx.fillStyle = '#ff0000';
        gameState.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
        gameState.ctx.fillStyle = '#00ff00';
        gameState.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
    });
}

function drawBullets() {
    gameState.bullets.forEach(bullet => {
        gameState.ctx.fillStyle = bullet.color;
        gameState.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // 添加发光效果
        gameState.ctx.shadowColor = bullet.color;
        gameState.ctx.shadowBlur = 5;
        gameState.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        gameState.ctx.shadowBlur = 0;
    });
}

function drawEnemyBullets() {
    gameState.enemyBullets.forEach(bullet => {
        gameState.ctx.fillStyle = bullet.color;
        gameState.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // 添加发光效果
        gameState.ctx.shadowColor = bullet.color;
        gameState.ctx.shadowBlur = 5;
        gameState.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        gameState.ctx.shadowBlur = 0;
    });
}

function drawExplosions() {
    gameState.explosions.forEach(explosion => {
        const alpha = explosion.life / explosion.maxLife;
        const size = (explosion.maxLife - explosion.life) * 4;
        
        // 绘制爆炸光环
        gameState.ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;
        gameState.ctx.beginPath();
        gameState.ctx.arc(explosion.x, explosion.y, size, 0, 2 * Math.PI);
        gameState.ctx.fill();
        
        // 绘制爆炸核心
        gameState.ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
        gameState.ctx.beginPath();
        gameState.ctx.arc(explosion.x, explosion.y, size * 0.5, 0, 2 * Math.PI);
        gameState.ctx.fill();
        
        // 绘制爆炸粒子
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const particleX = explosion.x + Math.cos(angle) * size * 0.8;
            const particleY = explosion.y + Math.sin(angle) * size * 0.8;
            
            gameState.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            gameState.ctx.fillRect(particleX - 1, particleY - 1, 2, 2);
        }
    });
}

function drawPowerUps() {
    gameState.powerUps.forEach(powerUp => {
        const x = powerUp.x + powerUp.width / 2;
        const y = powerUp.y + powerUp.height / 2;
        const size = powerUp.width / 2;
        
        // 绘制星星形状的道具
        gameState.ctx.fillStyle = '#ffff00';
        gameState.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const outerX = x + Math.cos(angle) * size;
            const outerY = y + Math.sin(angle) * size;
            
            if (i === 0) {
                gameState.ctx.moveTo(outerX, outerY);
            } else {
                gameState.ctx.lineTo(outerX, outerY);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = x + Math.cos(innerAngle) * (size * 0.5);
            const innerY = y + Math.sin(innerAngle) * (size * 0.5);
            gameState.ctx.lineTo(innerX, innerY);
        }
        gameState.ctx.closePath();
        gameState.ctx.fill();
        
        // 添加发光效果
        gameState.ctx.shadowColor = '#ffff00';
        gameState.ctx.shadowBlur = 10;
        gameState.ctx.fill();
        gameState.ctx.shadowBlur = 0;
    });
}

function drawHealthBar() {
    const barWidth = 200;
    const barHeight = 10;
    const x = (gameState.width - barWidth) / 2;
    const y = gameState.height - 20;
    
    // 绘制血条背景
    gameState.ctx.fillStyle = '#ff0000';
    gameState.ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制当前血量
    const healthPercent = gameState.player.health / gameState.player.maxHealth;
    gameState.ctx.fillStyle = '#00ff00';
    gameState.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    // 绘制血条边框
    gameState.ctx.strokeStyle = '#ffffff';
    gameState.ctx.lineWidth = 2;
    gameState.ctx.strokeRect(x, y, barWidth, barHeight);
}

function updateUI() {
    document.getElementById('scoreValue').textContent = gameState.score;
    document.getElementById('levelValue').textContent = gameState.level;
    document.getElementById('livesValue').textContent = gameState.lives;
    document.getElementById('powerValue').textContent = gameState.powerLevel;
} 