// ==================== 渲染系统 ====================

function render() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    drawBackground();
    
    // 绘制游戏对象
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawExplosions();
    drawPowerUps();
    
    // 更新UI
    updateUI();
}

function drawBackground() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    
    // 创建星空背景
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星星
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % canvas.height;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

function drawPlayer() {
    if (!gameState.player) return;
    
    const ctx = gameState.ctx;
    const player = gameState.player;
    
    // 绘制玩家飞船
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制飞船细节
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, 5);
    ctx.fillRect(player.x + 10, player.y + 15, player.width - 20, 5);
    
    // 绘制引擎火焰
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(player.x + 15, player.y + player.height, 10, 8);
}

function drawEnemies() {
    const ctx = gameState.ctx;
    
    gameState.enemies.forEach(enemy => {
        // 绘制敌人
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 绘制血条
        const healthBarWidth = enemy.width;
        const healthBarHeight = 4;
        const healthPercentage = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 8, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 8, healthBarWidth * healthPercentage, healthBarHeight);
    });
}

function drawBullets() {
    const ctx = gameState.ctx;
    
    gameState.bullets.forEach(bullet => {
        if (bullet.isSpecial) {
            // 特殊子弹 - 粉色
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // 添加发光效果
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            ctx.shadowBlur = 0;
        } else {
            // 普通子弹 - 青色
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
}

function drawEnemyBullets() {
    const ctx = gameState.ctx;
    
    gameState.enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawExplosions() {
    const ctx = gameState.ctx;
    
    gameState.explosions.forEach(explosion => {
        const alpha = explosion.life / explosion.maxLife;
        ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, 20 * alpha, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPowerUps() {
    const ctx = gameState.ctx;
    
    gameState.powerUps.forEach(powerUp => {
        if (powerUp.type === 'health') {
            // 绘制生命心形道具
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.moveTo(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 4);
            ctx.bezierCurveTo(
                powerUp.x + powerUp.width / 2, powerUp.y,
                powerUp.x, powerUp.y,
                powerUp.x, powerUp.y + powerUp.height / 4
            );
            ctx.bezierCurveTo(
                powerUp.x, powerUp.y + powerUp.height / 2,
                powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height,
                powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height
            );
            ctx.bezierCurveTo(
                powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height,
                powerUp.x + powerUp.width, powerUp.y + powerUp.height / 2,
                powerUp.x + powerUp.width, powerUp.y + powerUp.height / 4
            );
            ctx.bezierCurveTo(
                powerUp.x + powerUp.width, powerUp.y,
                powerUp.x + powerUp.width / 2, powerUp.y,
                powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 4
            );
            ctx.fill();
            
            // 添加发光效果
            ctx.shadowColor = '#ff69b4';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            // 绘制星形道具
            ctx.fillStyle = '#ffd700';
            drawStar(ctx, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 5, 8, 4);
            
            // 添加发光效果
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15;
            drawStar(ctx, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 5, 8, 4);
            ctx.shadowBlur = 0;
        }
    });
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function updateUI() {
    // 更新分数显示
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    
    // 更新关卡显示
    document.getElementById('level').textContent = gameState.level;
    
    // 更新生命显示
    document.getElementById('lives').textContent = gameState.lives;
    
    // 更新血量显示
    if (gameState.player) {
        document.getElementById('health').textContent = gameState.player.health;
    }
    
    // 更新火力显示
    document.getElementById('power').textContent = gameState.powerLevel;
    
    // 更新关卡完成界面的分数
    const levelScoreElement = document.getElementById('levelScore');
    if (levelScoreElement) {
        levelScoreElement.textContent = gameState.score.toLocaleString();
    }
    
    // 更新游戏结束界面的分数
    const finalScoreElement = document.getElementById('finalScore');
    if (finalScoreElement) {
        finalScoreElement.textContent = gameState.score.toLocaleString();
    }
    
    const finalScoreCompleteElement = document.getElementById('finalScoreComplete');
    if (finalScoreCompleteElement) {
        finalScoreCompleteElement.textContent = gameState.score.toLocaleString();
    }
} 