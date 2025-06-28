/**
 * 闪电战机游戏主类
 * 负责管理整个游戏的状态、逻辑和渲染
 */
class Game {
    /**
     * 游戏构造函数
     * 初始化游戏的所有基本属性和状态
     */
    constructor() {
        // 获取游戏画布和绘图上下文
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;  // 画布宽度
        this.height = this.canvas.height; // 画布高度
        
        // 游戏状态管理：start(开始界面), playing(游戏中), paused(暂停), gameOver(游戏结束), levelComplete(关卡完成)
        this.gameState = 'start';
        
        // 游戏核心数据
        this.score = 0;        // 当前得分
        this.level = 1;        // 当前关卡
        this.lives = 5;        // 剩余生命值
        this.powerLevel = 1;   // 火力等级
        
        // 游戏对象数组
        this.player = null;        // 玩家对象
        this.enemies = [];         // 敌人数组
        this.bullets = [];         // 玩家子弹数组
        this.enemyBullets = [];    // 敌人子弹数组
        this.explosions = [];      // 爆炸效果数组
        this.powerUps = [];        // 道具数组
        
        // 输入控制
        this.keys = {};            // 按键状态对象
        
        // 时间控制变量
        this.lastShot = 0;         // 上次射击时间
        this.lastSpecialShot = 0;  // 上次特殊射击时间
        this.enemySpawnTimer = 0;  // 敌人生成计时器
        
        // 关卡进度
        this.levelEnemiesKilled = 0;      // 当前关卡已击杀敌人数
        this.levelEnemiesRequired = 30;   // 每关需要击落的敌人数
        
        // 初始化游戏
        this.init();
    }
    
    /**
     * 游戏初始化方法
     * 设置事件监听器、创建玩家、加载关卡数据并启动游戏循环
     */
    init() {
        this.setupEventListeners();  // 设置事件监听器
        this.createPlayer();         // 创建玩家对象
        this.loadLevelData();        // 加载关卡配置数据
        this.gameLoop();             // 启动游戏主循环
    }
    
    /**
     * 设置游戏事件监听器
     * 监听键盘输入和按钮点击事件
     */
    setupEventListeners() {
        // 键盘按下事件监听
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;  // 记录按键状态为按下
            if (e.code === 'Space') {
                e.preventDefault();     // 防止空格键滚动页面
            }
        });
        
        // 键盘释放事件监听
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false; // 记录按键状态为释放
        });
        
        // 开始游戏按钮点击事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 重新开始按钮点击事件
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 下一关按钮点击事件
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
    }
    
    /**
     * 创建玩家对象
     * 初始化玩家的位置、大小、速度等属性
     */
    createPlayer() {
        this.player = {
            x: this.width / 2,      // 水平居中位置
            y: this.height - 80,    // 距离底部80像素
            width: 40,              // 玩家宽度
            height: 40,             // 玩家高度
            speed: 5,               // 移动速度
            health: 150,            // 当前生命值
            maxHealth: 150,         // 最大生命值
            color: '#4a90e2'        // 玩家颜色（蓝色）
        };
    }
    
    /**
     * 加载关卡配置数据
     * 定义每个关卡的敌人类型、生成频率和速度等参数
     */
    loadLevelData() {
        this.levelData = {
            // 第1关：基础敌人，较慢的生成速度
            1: { 
                enemies: ['fighter', 'bomber', 'scout'], 
                spawnRate: 80,      // 敌人生成间隔（帧数）
                enemySpeed: 1.5     // 敌人移动速度倍数
            },
            // 第2关：增加拦截机敌人
            2: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor'], 
                spawnRate: 75, 
                enemySpeed: 1.6 
            },
            // 第3关：增加炮舰敌人
            3: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship'], 
                spawnRate: 70, 
                enemySpeed: 1.7 
            },
            // 第4关：增加驱逐舰敌人
            4: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer'], 
                spawnRate: 65, 
                enemySpeed: 1.8 
            },
            // 第5关：增加航母敌人
            5: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier'], 
                spawnRate: 60, 
                enemySpeed: 1.9 
            },
            // 第6关：增加战列舰敌人
            6: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship'], 
                spawnRate: 55, 
                enemySpeed: 2.0 
            },
            // 第7关：增加无畏舰敌人
            7: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought'], 
                spawnRate: 50, 
                enemySpeed: 2.1 
            },
            // 第8关：增加泰坦级敌人
            8: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], 
                spawnRate: 45, 
                enemySpeed: 2.2 
            },
            // 第9关：最高难度
            9: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], 
                spawnRate: 40, 
                enemySpeed: 2.3 
            },
            // 第10关：终极挑战
            10: { 
                enemies: ['fighter', 'bomber', 'scout', 'interceptor', 'gunship', 'destroyer', 'carrier', 'battleship', 'dreadnought', 'titan'], 
                spawnRate: 35, 
                enemySpeed: 2.5 
            }
        };
    }
    
    /**
     * 开始游戏方法
     * 将游戏状态设置为playing并隐藏开始界面
     */
    startGame() {
        this.gameState = 'playing';  // 设置游戏状态为进行中
        document.getElementById('startScreen').classList.add('hidden');  // 隐藏开始界面
        this.resetLevel();  // 重置当前关卡
    }
    
    /**
     * 重新开始游戏方法
     * 重置所有游戏数据到初始状态
     */
    restartGame() {
        this.score = 0;        // 重置得分
        this.level = 1;        // 重置关卡
        this.lives = 5;        // 重置生命值
        this.powerLevel = 1;   // 重置火力等级
        this.gameState = 'playing';  // 设置游戏状态为进行中
        this.resetLevel();     // 重置当前关卡
        this.updateUI();       // 更新界面显示
        document.getElementById('gameOver').classList.add('hidden');  // 隐藏游戏结束界面
    }
    
    /**
     * 进入下一关方法
     * 增加关卡数和火力等级，重置关卡数据
     */
    nextLevel() {
        this.level++;          // 关卡数加1
        this.powerLevel++;     // 火力等级加1
        this.gameState = 'playing';  // 设置游戏状态为进行中
        this.resetLevel();     // 重置当前关卡
        this.updateUI();       // 更新界面显示
        document.getElementById('levelComplete').classList.add('hidden');  // 隐藏关卡完成界面
    }
    
    /**
     * 重置关卡方法
     * 清空所有游戏对象，重新创建玩家，重置关卡进度
     */
    resetLevel() {
        this.enemies = [];             // 清空敌人数组
        this.bullets = [];             // 清空玩家子弹数组
        this.enemyBullets = [];        // 清空敌人子弹数组
        this.explosions = [];          // 清空爆炸效果数组
        this.powerUps = [];            // 清空道具数组
        this.levelEnemiesKilled = 0;   // 重置当前关卡击杀敌人数
        this.enemySpawnTimer = 0;      // 重置敌人生成计时器
        this.createPlayer();           // 重新创建玩家对象
    }
    
    /**
     * 创建敌人对象
     * 根据敌人类型创建具有不同属性的敌人
     * @param {string} type - 敌人类型（fighter, bomber, scout等）
     * @returns {Object} 敌人对象
     */
    createEnemy(type) {
        // 敌人类型配置：定义每种敌人的属性
        const enemyTypes = {
            fighter: { width: 30, height: 30, health: 15, speed: 2, color: '#ff6b6b', points: 10, fireRate: 200 },      // 战斗机：基础敌人
            bomber: { width: 40, height: 35, health: 25, speed: 1.5, color: '#ff8e53', points: 20, fireRate: 150 },     // 轰炸机：血量较高
            scout: { width: 25, height: 25, health: 10, speed: 3, color: '#ffd93d', points: 15, fireRate: 250 },        // 侦察机：速度快
            interceptor: { width: 35, height: 30, health: 20, speed: 2.5, color: '#6bcf7f', points: 25, fireRate: 180 }, // 拦截机：平衡型
            gunship: { width: 45, height: 40, health: 35, speed: 1, color: '#a8e6cf', points: 35, fireRate: 120 },       // 炮舰：高血量，慢速
            destroyer: { width: 50, height: 45, health: 45, speed: 1.2, color: '#dcedc1', points: 50, fireRate: 100 },   // 驱逐舰：更强
            carrier: { width: 60, height: 50, health: 60, speed: 0.8, color: '#ffd3b6', points: 75, fireRate: 80 },      // 航母：大型敌人
            battleship: { width: 70, height: 55, health: 75, speed: 0.6, color: '#ffaaa5', points: 100, fireRate: 70 },  // 战列舰：超强
            dreadnought: { width: 80, height: 60, health: 100, speed: 0.5, color: '#ff8b94', points: 150, fireRate: 60 }, // 无畏舰：终极敌人
            titan: { width: 90, height: 65, health: 150, speed: 0.4, color: '#ff6b9d', points: 250, fireRate: 50 }        // 泰坦：Boss级敌人
        };
        
        const config = enemyTypes[type];  // 获取敌人配置
        const currentLevel = this.levelData[this.level];  // 获取当前关卡配置
        const speedMultiplier = currentLevel.enemySpeed;  // 获取速度倍数
        
        // 创建并返回敌人对象
        return {
            x: Math.random() * (this.width - config.width),  // 随机水平位置
            y: -config.height,                               // 从屏幕顶部上方开始
            width: config.width,                             // 敌人宽度
            height: config.height,                           // 敌人高度
            health: config.health + (this.level - 1) * 5,   // 血量随关卡递增
            maxHealth: config.health + (this.level - 1) * 5, // 最大血量
            speed: config.speed * speedMultiplier,           // 速度乘以关卡倍数
            color: config.color,                             // 敌人颜色
            points: config.points,                           // 击杀得分
            fireRate: config.fireRate,                       // 射击频率
            lastShot: 0,                                     // 上次射击时间
            type: type                                       // 敌人类型
        };
    }
    
    /**
     * 生成单个敌人方法
     * 根据当前关卡配置随机生成敌人
     */
    spawnEnemy() {
        const currentLevel = this.levelData[this.level];  // 获取当前关卡配置
        const enemyTypes = currentLevel.enemies;          // 获取可用的敌人类型
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];  // 随机选择敌人类型
        this.enemies.push(this.createEnemy(randomType));  // 创建敌人并添加到数组
    }
    
    /**
     * 生成敌人方法
     * 根据当前关卡配置定时生成敌人
     */
    spawnEnemies() {
        const currentLevel = this.levelData[this.level];  // 获取当前关卡配置
        this.enemySpawnTimer++;                           // 增加敌人生成计时器
        
        // 检查是否到了生成敌人的时间
        if (this.enemySpawnTimer >= currentLevel.spawnRate) {
            this.spawnEnemy();        // 生成敌人
            this.enemySpawnTimer = 0; // 重置计时器
        }
    }
    
    /**
     * 游戏主更新方法
     * 在每一帧调用，更新所有游戏对象的状态
     */
    update() {
        if (this.gameState !== 'playing') return;  // 如果不是游戏进行状态，直接返回
        
        this.updatePlayer();        // 更新玩家状态
        this.updateEnemies();       // 更新敌人状态
        this.updateBullets();       // 更新玩家子弹
        this.updateEnemyBullets();  // 更新敌人子弹
        this.updateExplosions();    // 更新爆炸效果
        this.updatePowerUps();      // 更新道具
        this.checkCollisions();     // 检查碰撞
        this.spawnEnemies();        // 生成新敌人
        this.checkLevelComplete();  // 检查关卡是否完成
    }
    
    /**
     * 更新玩家状态
     * 处理玩家移动、射击等操作
     */
    updatePlayer() {
        // 移动控制：根据按键状态移动玩家
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;  // 向左移动
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;  // 向右移动
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;  // 向上移动
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height) {
            this.player.y += this.player.speed;  // 向下移动
        }
        
        // 手动射击：按空格键射击
        if (this.keys['Space']) {
            this.shoot();
        }
        
        // 自动射击：根据火力等级自动发射子弹
        const now = Date.now();
        if (now - this.lastShot > 200 - (this.powerLevel - 1) * 20) {  // 射击间隔随火力等级减少
            this.shoot();
            this.lastShot = now;
        }
    }
    
    /**
     * 玩家射击方法
     * 根据火力等级发射不同数量的子弹
     */
    shoot() {
        const bulletCount = Math.min(this.powerLevel, 5);  // 子弹数量等于火力等级，最多5发
        const spread = (bulletCount - 1) * 10;             // 子弹之间的间距
        
        // 发射多颗子弹
        for (let i = 0; i < bulletCount; i++) {
            const offset = (i - (bulletCount - 1) / 2) * spread;  // 计算每颗子弹的水平偏移
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2 + offset,  // 子弹水平位置
                y: this.player.y,                                        // 子弹垂直位置
                width: 4,                                                // 子弹宽度
                height: 10,                                              // 子弹高度
                speed: 8,                                                // 子弹速度
                color: '#4a90e2',                                        // 子弹颜色（蓝色）
                damage: 15 + (this.powerLevel - 1) * 8                  // 子弹伤害随火力等级增加
            });
        }
    }
    
    /**
     * 更新敌人状态
     * 移动敌人、处理敌人射击、移除超出屏幕的敌人
     */
    updateEnemies() {
        // 从后往前遍历敌人数组，避免删除元素时索引错乱
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;  // 敌人向下移动
            
            // 敌人射击逻辑
            const now = Date.now();
            if (now - enemy.lastShot > enemy.fireRate) {  // 检查是否到了射击时间
                this.enemyShoot(enemy);  // 敌人射击
                enemy.lastShot = now;    // 更新上次射击时间
            }
            
            // 移除超出屏幕底部的敌人
            if (enemy.y > this.height) {
                this.enemies.splice(i, 1);  // 从数组中删除敌人
            }
        }
    }
    
    /**
     * 敌人射击方法
     * 创建敌人子弹对象
     * @param {Object} enemy - 射击的敌人对象
     */
    enemyShoot(enemy) {
        this.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,  // 子弹水平位置（敌人中心）
            y: enemy.y + enemy.height,         // 子弹垂直位置（敌人底部）
            width: 4,                          // 子弹宽度
            height: 8,                         // 子弹高度
            speed: 4,                          // 子弹速度
            color: '#ff6b6b',                  // 子弹颜色（红色）
            damage: 15                         // 子弹伤害
        });
    }
    
    /**
     * 更新玩家子弹
     * 移动子弹并移除超出屏幕的子弹
     */
    updateBullets() {
        // 从后往前遍历子弹数组，避免删除元素时索引错乱
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;  // 子弹向上移动
            
            // 移除超出屏幕顶部的子弹
            if (bullet.y < -bullet.height) {
                this.bullets.splice(i, 1);  // 从数组中删除子弹
            }
        }
    }
    
    /**
     * 更新敌人子弹
     * 移动敌人子弹并移除超出屏幕的子弹
     */
    updateEnemyBullets() {
        // 从后往前遍历敌人子弹数组，避免删除元素时索引错乱
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.y += bullet.speed;  // 敌人子弹向下移动
            
            // 移除超出屏幕底部的子弹
            if (bullet.y > this.height) {
                this.enemyBullets.splice(i, 1);  // 从数组中删除子弹
            }
        }
    }
    
    /**
     * 更新爆炸效果
     * 减少爆炸效果的生命周期并移除已结束的爆炸
     */
    updateExplosions() {
        // 从后往前遍历爆炸数组，避免删除元素时索引错乱
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life--;  // 减少爆炸效果的生命周期
            
            // 移除生命周期结束的爆炸效果
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);  // 从数组中删除爆炸效果
            }
        }
    }
    
    /**
     * 更新道具
     * 移动道具并移除超出屏幕的道具
     */
    updatePowerUps() {
        // 从后往前遍历道具数组，避免删除元素时索引错乱
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += 2;  // 道具向下移动
            
            // 移除超出屏幕底部的道具
            if (powerUp.y > this.height) {
                this.powerUps.splice(i, 1);  // 从数组中删除道具
            }
        }
    }
    
    /**
     * 碰撞检测方法
     * 检测各种游戏对象之间的碰撞并处理相应的游戏逻辑
     */
    checkCollisions() {
        // 玩家子弹与敌人碰撞检测
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {  // 检查子弹和敌人是否碰撞
                    enemy.health -= bullet.damage;      // 减少敌人血量
                    this.bullets.splice(i, 1);          // 移除子弹
                    
                    // 检查敌人是否被击毁
                    if (enemy.health <= 0) {
                        this.score += enemy.points;     // 增加得分
                        this.levelEnemiesKilled++;      // 增加击杀敌人数
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);  // 创建爆炸效果
                        this.enemies.splice(j, 1);      // 移除敌人
                        
                        // 随机掉落道具（10%概率）
                        if (Math.random() < 0.1) {
                            this.powerUps.push({
                                x: enemy.x + enemy.width / 2 - 10,  // 道具水平位置
                                y: enemy.y + enemy.height / 2,      // 道具垂直位置
                                width: 20,                          // 道具宽度
                                height: 20,                         // 道具高度
                                type: 'power'                       // 道具类型
                            });
                        }
                    }
                    break;  // 一颗子弹只能击中一个敌人
                }
            }
        }
        
        // 敌人子弹与玩家碰撞检测
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.isColliding(bullet, this.player)) {  // 检查敌人子弹和玩家是否碰撞
                this.player.health -= bullet.damage;      // 减少玩家血量
                this.enemyBullets.splice(i, 1);           // 移除敌人子弹
                
                // 检查玩家是否死亡
                if (this.player.health <= 0) {
                    this.lives--;                         // 减少生命值
                    this.player.health = this.player.maxHealth;  // 恢复玩家血量
                    
                    // 检查游戏是否结束
                    if (this.lives <= 0) {
                        this.gameOver();  // 游戏结束
                    }
                }
            }
        }
        
        // 玩家与敌人碰撞检测
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy)) {  // 检查玩家和敌人是否碰撞
                this.lives--;                            // 减少生命值
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);  // 创建爆炸效果
                this.enemies.splice(i, 1);               // 移除敌人
                
                // 检查游戏是否结束
                if (this.lives <= 0) {
                    this.gameOver();  // 游戏结束
                }
            }
        }
        
        // 玩家与道具碰撞检测
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.isColliding(this.player, powerUp)) {  // 检查玩家和道具是否碰撞
                this.powerLevel++;                        // 增加火力等级
                this.powerUps.splice(i, 1);               // 移除道具
            }
        }
    }
    
    /**
     * 矩形碰撞检测方法
     * 检测两个矩形对象是否发生碰撞
     * @param {Object} rect1 - 第一个矩形对象（包含x, y, width, height属性）
     * @param {Object} rect2 - 第二个矩形对象（包含x, y, width, height属性）
     * @returns {boolean} 是否发生碰撞
     */
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&    // 矩形1的左边界 < 矩形2的右边界
               rect1.x + rect1.width > rect2.x &&    // 矩形1的右边界 > 矩形2的左边界
               rect1.y < rect2.y + rect2.height &&   // 矩形1的上边界 < 矩形2的下边界
               rect1.y + rect1.height > rect2.y;     // 矩形1的下边界 > 矩形2的上边界
    }
    
    /**
     * 创建爆炸效果
     * 在指定位置创建爆炸动画效果
     * @param {number} x - 爆炸效果的水平位置
     * @param {number} y - 爆炸效果的垂直位置
     */
    createExplosion(x, y) {
        this.explosions.push({
            x: x,           // 爆炸效果的水平位置
            y: y,           // 爆炸效果的垂直位置
            life: 10,       // 爆炸效果的生命周期
            maxLife: 10     // 爆炸效果的最大生命周期
        });
    }
    
    /**
     * 检查关卡是否完成
     * 当击杀敌人数达到要求时触发关卡完成
     */
    checkLevelComplete() {
        if (this.levelEnemiesKilled >= this.levelEnemiesRequired) {
            this.levelComplete();  // 触发关卡完成
        }
    }
    
    /**
     * 关卡完成处理
     * 显示关卡完成界面
     */
    levelComplete() {
        this.gameState = 'levelComplete';  // 设置游戏状态为关卡完成
        document.getElementById('levelComplete').classList.remove('hidden');  // 显示关卡完成界面
    }
    
    /**
     * 游戏结束处理
     * 显示游戏结束界面并显示最终得分
     */
    gameOver() {
        this.gameState = 'gameOver';  // 设置游戏状态为游戏结束
        document.getElementById('finalScore').textContent = this.score;  // 显示最终得分
        document.getElementById('gameOver').classList.remove('hidden');  // 显示游戏结束界面
    }
    
    /**
     * 更新用户界面
     * 更新屏幕上显示的游戏信息（得分、关卡、生命值、火力等级）
     */
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;      // 更新得分显示
        document.getElementById('levelValue').textContent = this.level;      // 更新关卡显示
        document.getElementById('livesValue').textContent = this.lives;      // 更新生命值显示
        document.getElementById('powerValue').textContent = this.powerLevel; // 更新火力等级显示
    }
    
    /**
     * 游戏渲染方法
     * 绘制所有游戏对象到画布上
     */
    render() {
        // 清空画布：使用半透明颜色创建拖尾效果
        this.ctx.fillStyle = 'rgba(12, 20, 69, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制背景星星
        this.drawStars();
        
        // 绘制玩家飞机
        this.drawPlayer();
        
        // 绘制敌人
        this.drawEnemies();
        
        // 绘制玩家子弹
        this.drawBullets();
        
        // 绘制敌人子弹
        this.drawEnemyBullets();
        
        // 绘制爆炸效果
        this.drawExplosions();
        
        // 绘制道具
        this.drawPowerUps();
        
        // 绘制玩家血条
        this.drawHealthBar();
    }
    
    /**
     * 绘制背景星星
     * 创建动态的星空背景效果
     */
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';  // 半透明白色
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width;                    // 星星水平位置
            const y = (i * 73 + Date.now() * 0.01) % this.height; // 星星垂直位置（随时间移动）
            this.ctx.fillRect(x, y, 1, 1);                      // 绘制1x1像素的星星
        }
    }
    
    /**
     * 绘制玩家飞机
     * 绘制玩家的三角形飞机造型
     */
    drawPlayer() {
        const x = this.player.x + this.player.width / 2;   // 飞机中心水平位置
        const y = this.player.y + this.player.height;      // 飞机底部垂直位置
        const size = this.player.width / 2;                // 飞机大小
        
        // 绘制飞机主体（三角形）
        this.ctx.fillStyle = this.player.color;            // 设置飞机颜色
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - this.player.height);        // 三角形顶点
        this.ctx.lineTo(x - size, y);                      // 左下角
        this.ctx.lineTo(x + size, y);                      // 右下角
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制飞机细节（内部白色三角形）
        this.ctx.fillStyle = '#ffffff';                    // 白色
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - this.player.height + 5);    // 内部三角形顶点
        this.ctx.lineTo(x - size + 5, y - 5);              // 内部左下角
        this.ctx.lineTo(x + size - 5, y - 5);              // 内部右下角
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制飞机引擎（红色矩形）
        this.ctx.fillStyle = '#ff6b6b';                    // 红色
        this.ctx.fillRect(x - 3, y - 8, 6, 8);             // 引擎位置和大小
    }
    
    /**
     * 绘制敌人
     * 绘制所有敌人飞机，包括血条显示
     */
    drawEnemies() {
        this.enemies.forEach(enemy => {
            const x = enemy.x + enemy.width / 2;   // 敌人中心水平位置
            const y = enemy.y;                     // 敌人顶部垂直位置
            const size = enemy.width / 2;          // 敌人大小
            
            // 绘制敌人飞机主体（倒三角形）
            this.ctx.fillStyle = enemy.color;      // 设置敌人颜色
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + enemy.height);  // 三角形顶点（底部）
            this.ctx.lineTo(x - size, y);          // 左上角
            this.ctx.lineTo(x + size, y);          // 右上角
            this.ctx.closePath();
            this.ctx.fill();
            
            // 绘制敌人飞机细节（内部白色三角形）
            this.ctx.fillStyle = '#ffffff';        // 白色
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + enemy.height - 5);  // 内部三角形顶点
            this.ctx.lineTo(x - size + 5, y + 5);      // 内部左上角
            this.ctx.lineTo(x + size - 5, y + 5);      // 内部右上角
            this.ctx.closePath();
            this.ctx.fill();
            
            // 绘制敌人血条
            const healthPercent = enemy.health / enemy.maxHealth;  // 计算血量百分比
            this.ctx.fillStyle = '#ff0000';                        // 红色背景
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);  // 血条背景
            this.ctx.fillStyle = '#00ff00';                        // 绿色血量
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);  // 当前血量
        });
    }
    
    /**
     * 绘制玩家子弹
     * 绘制所有玩家发射的子弹，带有发光效果
     */
    drawBullets() {
        this.bullets.forEach(bullet => {
            // 绘制激光束效果
            this.ctx.fillStyle = bullet.color;  // 设置子弹颜色
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);  // 绘制子弹主体
            
            // 添加发光效果
            this.ctx.shadowColor = bullet.color;  // 设置阴影颜色
            this.ctx.shadowBlur = 5;              // 设置阴影模糊度
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);  // 重新绘制以产生发光效果
            this.ctx.shadowBlur = 0;              // 重置阴影模糊度
        });
    }
    
    /**
     * 绘制敌人子弹
     * 绘制所有敌人发射的子弹，带有发光效果
     */
    drawEnemyBullets() {
        this.enemyBullets.forEach(bullet => {
            // 绘制敌人激光束效果
            this.ctx.fillStyle = bullet.color;  // 设置子弹颜色
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);  // 绘制子弹主体
            
            // 添加发光效果
            this.ctx.shadowColor = bullet.color;  // 设置阴影颜色
            this.ctx.shadowBlur = 5;              // 设置阴影模糊度
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);  // 重新绘制以产生发光效果
            this.ctx.shadowBlur = 0;              // 重置阴影模糊度
        });
    }
    
    /**
     * 绘制爆炸效果
     * 绘制所有爆炸动画效果，包括光环、核心和粒子
     */
    drawExplosions() {
        this.explosions.forEach(explosion => {
            const alpha = explosion.life / explosion.maxLife;  // 计算透明度
            const size = (explosion.maxLife - explosion.life) * 4;  // 计算爆炸大小
            
            // 绘制爆炸光环（外圈）
            this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;  // 橙色半透明
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, size, 0, 2 * Math.PI);  // 绘制圆形
            this.ctx.fill();
            
            // 绘制爆炸核心（内圈）
            this.ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;  // 黄色
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, size * 0.5, 0, 2 * Math.PI);  // 绘制较小的圆形
            this.ctx.fill();
            
            // 绘制爆炸粒子（8个方向的粒子）
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;  // 计算粒子角度
                const particleX = explosion.x + Math.cos(angle) * size * 0.8;  // 粒子水平位置
                const particleY = explosion.y + Math.sin(angle) * size * 0.8;  // 粒子垂直位置
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;  // 白色粒子
                this.ctx.fillRect(particleX - 1, particleY - 1, 2, 2);  // 绘制2x2像素的粒子
            }
        });
    }
    
    /**
     * 绘制道具
     * 绘制所有道具，使用五角星形状
     */
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            const x = powerUp.x + powerUp.width / 2;   // 道具中心水平位置
            const y = powerUp.y + powerUp.height / 2;  // 道具中心垂直位置
            const size = powerUp.width / 2;            // 道具大小
            
            // 绘制星星形状的道具
            this.ctx.fillStyle = '#ffff00';            // 黄色
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;  // 计算外角点角度
                const outerX = x + Math.cos(angle) * size;          // 外角点水平位置
                const outerY = y + Math.sin(angle) * size;          // 外角点垂直位置
                
                if (i === 0) {
                    this.ctx.moveTo(outerX, outerY);  // 移动到第一个点
                } else {
                    this.ctx.lineTo(outerX, outerY);  // 连接到外角点
                }
                
                const innerAngle = angle + Math.PI / 5;  // 计算内角点角度
                const innerX = x + Math.cos(innerAngle) * (size * 0.5);  // 内角点水平位置
                const innerY = y + Math.sin(innerAngle) * (size * 0.5);  // 内角点垂直位置
                this.ctx.lineTo(innerX, innerY);  // 连接到内角点
            }
            this.ctx.closePath();
            this.ctx.fill();
            
            // 添加发光效果
            this.ctx.shadowColor = '#ffff00';  // 黄色阴影
            this.ctx.shadowBlur = 10;          // 阴影模糊度
            this.ctx.fill();                   // 重新填充以产生发光效果
            this.ctx.shadowBlur = 0;           // 重置阴影模糊度
        });
    }
    
    /**
     * 绘制玩家血条
     * 在屏幕底部显示玩家的血量状态
     */
    drawHealthBar() {
        const barWidth = 200;   // 血条宽度
        const barHeight = 10;   // 血条高度
        const x = (this.width - barWidth) / 2;  // 血条水平位置（居中）
        const y = this.height - 20;             // 血条垂直位置（底部）
        
        // 绘制血条背景（红色）
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // 绘制当前血量（绿色）
        const healthPercent = this.player.health / this.player.maxHealth;  // 计算血量百分比
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // 绘制血条边框（白色）
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }
    
    /**
     * 游戏主循环
     * 持续更新游戏状态和渲染画面，实现60FPS的游戏体验
     */
    gameLoop() {
        this.update();      // 更新游戏逻辑
        this.render();      // 渲染游戏画面
        this.updateUI();    // 更新用户界面
        requestAnimationFrame(() => this.gameLoop());  // 请求下一帧动画
    }
}

/**
 * 游戏启动代码
 * 当页面加载完成后自动创建游戏实例
 */
window.addEventListener('load', () => {
    new Game();  // 创建新的游戏实例
}); 