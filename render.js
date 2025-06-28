// ==================== 背景系统 ====================
let backgroundY = 0;
const backgroundSpeed = 0.5;

// 背景层管理
const backgroundLayers = {
    stars: { y: 0, speed: 0.3, elements: [] },
    nebula: { y: 0, speed: 0.1, elements: [] },
    asteroids: { y: 0, speed: 0.8, elements: [] },
    spaceDebris: { y: 0, speed: 1.2, elements: [] }
};

// 初始化背景元素
function initBackgroundElements() {
    // 初始化星星
    for (let i = 0; i < 100; i++) {
        backgroundLayers.stars.elements.push({
            x: Math.random() * gameState.width,
            y: Math.random() * gameState.height,
            size: Math.random() * 3 + 1,
            brightness: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.01
        });
    }
    
    // 初始化星云
    for (let i = 0; i < 8; i++) {
        backgroundLayers.nebula.elements.push({
            x: Math.random() * gameState.width,
            y: Math.random() * gameState.height,
            radius: Math.random() * 150 + 100,
            color: ['#ff6b9d', '#4a90e2', '#50c878', '#ffd700'][Math.floor(Math.random() * 4)],
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    
    // 初始化小行星
    for (let i = 0; i < 15; i++) {
        backgroundLayers.asteroids.elements.push({
            x: Math.random() * gameState.width,
            y: Math.random() * gameState.height,
            size: Math.random() * 8 + 3,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        });
    }
    
    // 初始化太空碎片
    for (let i = 0; i < 25; i++) {
        backgroundLayers.spaceDebris.elements.push({
            x: Math.random() * gameState.width,
            y: Math.random() * gameState.height,
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03
        });
    }
}

function updateBackground() {
    backgroundY += backgroundSpeed;
    
    // 更新各层背景
    Object.values(backgroundLayers).forEach(layer => {
        layer.y += layer.speed;
        if (layer.y >= gameState.height) {
            layer.y = 0;
        }
    });
    
    // 更新星星闪烁
    backgroundLayers.stars.elements.forEach(star => {
        star.y += backgroundLayers.stars.speed;
        if (star.y > gameState.height) {
            star.y = -10;
            star.x = Math.random() * gameState.width;
        }
    });
    
    // 更新小行星
    backgroundLayers.asteroids.elements.forEach(asteroid => {
        asteroid.y += backgroundLayers.asteroids.speed;
        asteroid.rotation += asteroid.rotationSpeed;
        if (asteroid.y > gameState.height) {
            asteroid.y = -20;
            asteroid.x = Math.random() * gameState.width;
        }
    });
    
    // 更新太空碎片
    backgroundLayers.spaceDebris.elements.forEach(debris => {
        debris.y += backgroundLayers.spaceDebris.speed;
        debris.rotation += debris.rotationSpeed;
        if (debris.y > gameState.height) {
            debris.y = -15;
            debris.x = Math.random() * gameState.width;
        }
    });
}

function drawBackground() {
    const ctx = gameState.ctx;
    const width = gameState.width;
    const height = gameState.height;
    
    // 创建深空渐变背景
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(0.3, '#1a1a4a');
    gradient.addColorStop(0.6, '#2a2a6a');
    gradient.addColorStop(0.8, '#1a1a4a');
    gradient.addColorStop(1, '#0a0a2a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制星云
    drawNebula();
    
    // 绘制星星
    drawStars();
    
    // 绘制背景小行星
    drawBackgroundAsteroids();
    
    // 绘制太空碎片
    drawSpaceDebris();
    
    // 绘制动态光效
    drawLightEffects();
}

function drawNebula() {
    const ctx = gameState.ctx;
    
    backgroundLayers.nebula.elements.forEach(nebula => {
        const x = nebula.x;
        const y = (nebula.y + backgroundLayers.nebula.y) % gameState.height;
        
        // 创建径向渐变
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius);
        gradient.addColorStop(0, nebula.color + '40');
        gradient.addColorStop(0.5, nebula.color + '20');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawStars() {
    const ctx = gameState.ctx;
    const time = Date.now() * 0.001;
    
    backgroundLayers.stars.elements.forEach(star => {
        // 计算闪烁效果
        const twinkle = 0.3 + 0.7 * Math.sin(time * star.twinkleSpeed);
        const alpha = star.brightness * twinkle;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加星芒效果
        if (star.size > 2) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(star.x - star.size * 2, star.y);
            ctx.lineTo(star.x + star.size * 2, star.y);
            ctx.moveTo(star.x, star.y - star.size * 2);
            ctx.lineTo(star.x, star.y + star.size * 2);
            ctx.stroke();
        }
    });
}

function drawBackgroundAsteroids() {
    const ctx = gameState.ctx;
    
    backgroundLayers.asteroids.elements.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        
        // 绘制背景小行星
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(0, 0, asteroid.size, asteroid.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加阴影
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(0, asteroid.size * 0.3, asteroid.size * 0.8, asteroid.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function drawSpaceDebris() {
    const ctx = gameState.ctx;
    
    backgroundLayers.spaceDebris.elements.forEach(debris => {
        ctx.save();
        ctx.translate(debris.x, debris.y);
        ctx.rotate(debris.rotation);
        
        // 绘制金属碎片
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-debris.width/2, -debris.height/2, debris.width, debris.height);
        
        // 添加高光
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-debris.width/2 + 1, -debris.height/2 + 1, debris.width * 0.3, debris.height * 0.3);
        
        ctx.restore();
    });
}

function drawLightEffects() {
    const ctx = gameState.ctx;
    const time = Date.now() * 0.001;
    
    // 只保留简单的动态光束，移除半透明圆形和水平移动的长方形
    for (let i = 0; i < 2; i++) {
        const x = (i * 400 + time * 30) % gameState.width;
        const gradient = ctx.createLinearGradient(x, 0, x, gameState.height);
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.02)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 30, 0, 60, gameState.height);
    }
}

// ==================== 渲染系统 ====================

function render() {
    if (gameState.currentState !== 'playing') return;
    
    // 更新背景
    updateBackground();
    
    // 绘制背景
    drawBackground();
    
    // 绘制游戏对象
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawExplosions();
    drawPowerUps();
    drawAsteroids();
    
    // 更新UI
    updateUI();
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

function drawAsteroids() {
    const ctx = gameState.ctx;
    
    gameState.asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        
        // 绘制小行星主体
        ctx.fillStyle = asteroid.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, asteroid.size, asteroid.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加阴影效果
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(0, asteroid.size * 0.3, asteroid.size * 0.8, asteroid.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加高光效果
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(-asteroid.size * 0.3, -asteroid.size * 0.2, asteroid.size * 0.3, asteroid.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 绘制血条
        const healthBarWidth = asteroid.size * 2;
        const healthBarHeight = 4;
        const healthPercentage = asteroid.health / asteroid.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(asteroid.x - healthBarWidth / 2, asteroid.y - asteroid.size - 10, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(asteroid.x - healthBarWidth / 2, asteroid.y - asteroid.size - 10, healthBarWidth * healthPercentage, healthBarHeight);
    });
}

function updateUI() {
    // 更新分数
    document.getElementById('score').textContent = gameState.score;
    
    // 更新关卡
    document.getElementById('level').textContent = gameState.level;
    
    // 更新生命值显示
    const livesElement = document.getElementById('lives');
    livesElement.innerHTML = '❤️'.repeat(gameState.player.lives);
    
    // 更新波次显示
    const waveElement = document.getElementById('wave');
    waveElement.textContent = gameState.currentWave || 1;
    
    // 更新火力显示
    const powerElement = document.getElementById('power');
    powerElement.innerHTML = '⭐'.repeat(gameState.player.powerLevel);
} 