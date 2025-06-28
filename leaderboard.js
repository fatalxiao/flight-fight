// ==================== 排行榜系统 ====================

const LEADERBOARD_KEY = 'flightFightLeaderboard';
const MAX_ENTRIES = 10;

// 获取排行榜数据
function getLeaderboard() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
}

// 保存排行榜数据
function saveLeaderboard(leaderboard) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// 添加新分数到排行榜
function addScore(score, level, date = new Date().toISOString()) {
    const leaderboard = getLeaderboard();
    
    // 创建新记录
    const newEntry = {
        score: score,
        level: level,
        date: date,
        timestamp: Date.now()
    };
    
    // 添加到排行榜
    leaderboard.push(newEntry);
    
    // 按分数降序排序
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留前10名
    if (leaderboard.length > MAX_ENTRIES) {
        leaderboard.splice(MAX_ENTRIES);
    }
    
    // 保存到localStorage
    saveLeaderboard(leaderboard);
    
    return leaderboard;
}

// 检查分数是否进入排行榜
function checkHighScore(score) {
    const leaderboard = getLeaderboard();
    if (leaderboard.length < MAX_ENTRIES) {
        return true; // 排行榜未满，直接进入
    }
    return score > leaderboard[leaderboard.length - 1].score;
}

// 获取玩家在排行榜中的位置
function getPlayerRank(score) {
    const leaderboard = getLeaderboard();
    for (let i = 0; i < leaderboard.length; i++) {
        if (score >= leaderboard[i].score) {
            return i + 1;
        }
    }
    return leaderboard.length + 1;
}

// 显示排行榜界面
function showLeaderboard() {
    const leaderboard = getLeaderboard();
    const leaderboardElement = document.getElementById('leaderboard');
    const leaderboardList = document.getElementById('leaderboardList');
    
    // 清空现有内容
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p>暂无记录</p>';
    } else {
        leaderboard.forEach((entry, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'leaderboard-item';
            
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            const date = new Date(entry.date).toLocaleDateString();
            
            listItem.innerHTML = `
                <div class="rank ${rankClass}">${rank}</div>
                <div class="score">${entry.score.toLocaleString()}</div>
                <div class="level">第${entry.level}关</div>
                <div class="date">${date}</div>
            `;
            
            leaderboardList.appendChild(listItem);
        });
    }
    
    leaderboardElement.classList.remove('hidden');
}

// 隐藏排行榜界面
function hideLeaderboard() {
    document.getElementById('leaderboard').classList.add('hidden');
}

// 在游戏结束时处理排行榜
function handleGameEnd(score, level) {
    if (checkHighScore(score)) {
        // 新纪录！
        addScore(score, level);
        showNewRecordDialog(score, level);
    } else {
        // 显示最终分数和排行榜
        showFinalScoreDialog(score, level);
    }
}

// 显示新纪录对话框
function showNewRecordDialog(score, level) {
    const newRecordElement = document.getElementById('newRecord');
    const newRecordScore = document.getElementById('newRecordScore');
    const newRecordRank = document.getElementById('newRecordRank');
    
    newRecordScore.textContent = score.toLocaleString();
    newRecordRank.textContent = getPlayerRank(score);
    
    newRecordElement.classList.remove('hidden');
}

// 隐藏新纪录对话框
function hideNewRecordDialog() {
    document.getElementById('newRecord').classList.add('hidden');
}

// 显示最终分数对话框
function showFinalScoreDialog(score, level) {
    const finalScoreElement = document.getElementById('finalScoreDialog');
    const finalScoreValue = document.getElementById('finalScoreValue');
    const finalScoreRank = document.getElementById('finalScoreRank');
    
    finalScoreValue.textContent = score.toLocaleString();
    finalScoreRank.textContent = getPlayerRank(score);
    
    finalScoreElement.classList.remove('hidden');
}

// 隐藏最终分数对话框
function hideFinalScoreDialog() {
    document.getElementById('finalScoreDialog').classList.add('hidden');
} 