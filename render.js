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
    
    // 绘制玩家飞船主体
    ctx.fillStyle = player.color;
    ctx.beginPath();
    // 飞船头部
    ctx.moveTo(player.x + player.width / 2, player.y);
    // 飞船左侧
    ctx.lineTo(player.x, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width * 0.2, player.y + player.height);
    // 飞船底部
    ctx.lineTo(player.x + player.width * 0.8, player.y + player.height);
    // 飞船右侧
    ctx.lineTo(player.x + player.width, player.y + player.height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // 绘制飞船驾驶舱
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, player.y + player.height * 0.3, player.width * 0.15, player.height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制飞船细节线条
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // 中央线条
    ctx.moveTo(player.x + player.width / 2, player.y + player.height * 0.2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.8);
    // 侧边线条
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.4);
    ctx.lineTo(player.x + player.width * 0.3, player.y + player.height * 0.7);
    ctx.moveTo(player.x + player.width * 0.7, player.y + player.height * 0.4);
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.7);
    ctx.stroke();
    
    // 绘制引擎火焰
    const time = Date.now() * 0.01;
    const flameSize = 8 + Math.sin(time) * 3;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.25, player.y + player.height + flameSize);
    ctx.lineTo(player.x + player.width * 0.35, player.y + player.height + flameSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width * 0.7, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.65, player.y + player.height + flameSize * 0.8);
    ctx.lineTo(player.x + player.width * 0.75, player.y + player.height + flameSize * 0.8);
    ctx.closePath();
    ctx.fill();
}

function drawEnemies() {
    const ctx = gameState.ctx;
    
    gameState.enemies.forEach(enemy => {
        // 根据敌人类型绘制不同的飞船设计
        drawEnemyShip(ctx, enemy);
        
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

function drawEnemyShip(ctx, enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const width = enemy.width;
    const height = enemy.height;
    
    // 根据敌人类型选择不同的设计
    switch (enemy.type) {
        case 'fighter':
            drawFighterShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'bomber':
            drawBomberShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'scout':
            drawScoutShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'interceptor':
            drawInterceptorShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'gunship':
            drawGunshipShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'destroyer':
            drawDestroyerShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'carrier':
            drawCarrierShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'battleship':
            drawBattleshipShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'dreadnought':
            drawDreadnoughtShip(ctx, x, y, width, height, enemy.color);
            break;
        case 'titan':
            drawTitanShip(ctx, x, y, width, height, enemy.color);
            break;
        default:
            drawFighterShip(ctx, x, y, width, height, enemy.color);
    }
}

function drawFighterShip(ctx, x, y, width, height, color) {
    // 战斗机 - 小型敏捷
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height * 0.3);
    ctx.lineTo(x + width * 0.3, y);
    ctx.lineTo(x + width * 0.7, y);
    ctx.lineTo(x + width, y + height * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // 驾驶舱
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.4, width * 0.1, height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBomberShip(ctx, x, y, width, height, color) {
    // 轰炸机 - 宽大厚重
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x + width * 0.1, y + height * 0.2);
    ctx.lineTo(x + width * 0.2, y);
    ctx.lineTo(x + width * 0.8, y);
    ctx.lineTo(x + width * 0.9, y + height * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // 炸弹舱
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + width * 0.3, y + height * 0.3, width * 0.4, height * 0.4);
}

function drawScoutShip(ctx, x, y, width, height, color) {
    // 侦察机 - 细长快速
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x + width * 0.2, y + height * 0.2);
    ctx.lineTo(x + width * 0.4, y);
    ctx.lineTo(x + width * 0.6, y);
    ctx.lineTo(x + width * 0.8, y + height * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // 传感器
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.3, width * 0.08, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawInterceptorShip(ctx, x, y, width, height, color) {
    // 拦截机 - 平衡型
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x + width * 0.15, y + height * 0.25);
    ctx.lineTo(x + width * 0.35, y);
    ctx.lineTo(x + width * 0.65, y);
    ctx.lineTo(x + width * 0.85, y + height * 0.25);
    ctx.closePath();
    ctx.fill();
    
    // 武器系统
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(x + width * 0.2, y + height * 0.4, width * 0.6, height * 0.2);
}

function drawGunshipShip(ctx, x, y, width, height, color) {
    // 炮舰 - 重型武器
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x + width * 0.05, y + height * 0.3);
    ctx.lineTo(x + width * 0.25, y);
    ctx.lineTo(x + width * 0.75, y);
    ctx.lineTo(x + width * 0.95, y + height * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // 主炮
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + width * 0.4, y + height * 0.2, width * 0.2, height * 0.6);
    
    // 副炮
    ctx.fillStyle = '#444444';
    ctx.fillRect(x + width * 0.1, y + height * 0.4, width * 0.15, height * 0.3);
    ctx.fillRect(x + width * 0.75, y + height * 0.4, width * 0.15, height * 0.3);
}

function drawDestroyerShip(ctx, x, y, width, height, color) {
    // 驱逐舰 - 大型战舰
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height * 0.4);
    ctx.lineTo(x + width * 0.2, y);
    ctx.lineTo(x + width * 0.8, y);
    ctx.lineTo(x + width, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // 装甲板
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + width * 0.1, y + height * 0.2, width * 0.8, height * 0.5);
    
    // 炮塔
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + width * 0.3, y + height * 0.1, width * 0.4, height * 0.3);
}

function drawCarrierShip(ctx, x, y, width, height, color) {
    // 航母 - 超大型
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // 飞行甲板
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + width * 0.1, y + height * 0.2, width * 0.8, height * 0.6);
    
    // 指挥塔
    ctx.fillStyle = '#444444';
    ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.4);
}

function drawBattleshipShip(ctx, x, y, width, height, color) {
    // 战列舰 - 超重型
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // 主炮塔
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + width * 0.2, y + height * 0.1, width * 0.6, height * 0.4);
    
    // 副炮塔
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + width * 0.05, y + height * 0.3, width * 0.2, height * 0.3);
    ctx.fillRect(x + width * 0.75, y + height * 0.3, width * 0.2, height * 0.3);
}

function drawDreadnoughtShip(ctx, x, y, width, height, color) {
    // 无畏舰 - 终极战舰
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // 重型装甲
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + width * 0.05, y + height * 0.1, width * 0.9, height * 0.7);
    
    // 超级炮塔
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + width * 0.15, y + height * 0.05, width * 0.7, height * 0.5);
    
    // 能量核心
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.3, width * 0.1, height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawTitanShip(ctx, x, y, width, height, color) {
    // 泰坦 - Boss级
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // 超级装甲
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + width * 0.02, y + height * 0.05, width * 0.96, height * 0.8);
    
    // 能量护盾
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + width * 0.05, y + height * 0.1, width * 0.9, height * 0.7);
    
    // 核心能量
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.25, width * 0.15, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
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