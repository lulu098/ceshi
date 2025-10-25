// 游戏配置
const config = {
    easy: { rows: 3, cols: 4 },
    medium: { rows: 4, cols: 4 },
    hard: { rows: 4, cols: 5 }
};

// 游戏状态
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    gameStarted: false,
    currentLevel: 'medium'
};

// 可爱的图标集合
const icons = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐨', '🦊', '🐷', '🐸', '🐙', 
               '🦄', '🐝', '🍎', '🍓', '🍉', '🍌', '🍒', '🍩', '🍭', '🍦'];

// DOM 元素
const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const matchesElement = document.getElementById('matches');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const difficultyButtons = document.querySelectorAll('.difficulty button');
const messageElement = document.getElementById('message');
const overlayElement = document.getElementById('overlay');
const closeMessageButton = document.getElementById('close-message');
const finalStatsElement = document.getElementById('final-stats');
const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const winSound = document.getElementById('win-sound');

// 初始化游戏
function initGame() {
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.gameStarted = false;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    updateGameInfo();
    createCards();
}

// 创建卡片
function createCards() {
    gameBoard.innerHTML = '';
    const level = config[gameState.currentLevel];
    const totalCards = level.rows * level.cols;
    gameState.totalPairs = totalCards / 2;
    
    // 设置游戏板网格
    gameBoard.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;
    
    // 选择图标
    const selectedIcons = icons.slice(0, gameState.totalPairs);
    const cardIcons = [...selectedIcons, ...selectedIcons];
    
    // 洗牌算法
    shuffleArray(cardIcons);
    
    // 创建卡片元素
    cardIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = '?';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = icon;
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        card.addEventListener('click', () => flipCard(card, icon));
        
        gameBoard.appendChild(card);
        gameState.cards.push({
            element: card,
            icon: icon,
            flipped: false,
            matched: false
        });
    });
}

// 洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 翻转卡片
function flipCard(card, icon) {
    if (!gameState.gameStarted) {
        startGame();
    }
    
    const cardIndex = parseInt(card.dataset.index);
    const cardData = gameState.cards[cardIndex];
    
    // 如果卡片已经匹配或已经翻转，则忽略点击
    if (cardData.matched || cardData.flipped || gameState.flippedCards.length >= 2) {
        return;
    }
    
    // 翻转卡片
    card.classList.add('flipped');
    cardData.flipped = true;
    gameState.flippedCards.push(cardData);
    
    // 播放翻转音效（使用本地文件）
    try {
        flipSound.currentTime = 0;
        flipSound.play();
    } catch (error) {
        console.log('声音播放失败:', error);
    }
    
    // 检查是否匹配
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateGameInfo();
        
        const [firstCard, secondCard] = gameState.flippedCards;
        
        if (firstCard.icon === secondCard.icon) {
            // 匹配成功
            setTimeout(() => {
                firstCard.matched = true;
                secondCard.matched = true;
                firstCard.element.classList.add('matched');
                secondCard.element.classList.add('matched');
                
                gameState.matchedPairs++;
                updateGameInfo();
                
                // 播放匹配音效（使用本地文件）
                try {
                    matchSound.currentTime = 0;
                    matchSound.play();
                } catch (error) {
                    console.log('声音播放失败:', error);
                }
                
                // 清空已翻转的卡片
                gameState.flippedCards = [];
                
                // 检查游戏是否结束
                checkGameEnd();
            }, 500);
        } else {
            // 不匹配，翻回
            setTimeout(() => {
                firstCard.element.classList.remove('flipped');
                secondCard.element.classList.remove('flipped');
                firstCard.flipped = false;
                secondCard.flipped = false;
                
                gameState.flippedCards = [];
            }, 1000);
        }
    }
}

// 检查游戏是否结束
function checkGameEnd() {
    if (gameState.matchedPairs === gameState.totalPairs) {
        clearInterval(gameState.timerInterval);
        
        // 播放胜利音效（使用本地文件）
        try {
            winSound.currentTime = 0;
            winSound.play();
        } catch (error) {
            console.log('声音播放失败:', error);
        }
        
        // 显示胜利消息
        setTimeout(() => {
            showMessage();
        }, 1000);
    }
}

// 开始游戏
function startGame() {
    gameState.gameStarted = true;
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateGameInfo();
    }, 1000);
}

// 更新游戏信息显示
function updateGameInfo() {
    timerElement.textContent = gameState.timer;
    movesElement.textContent = gameState.moves;
    matchesElement.textContent = `${gameState.matchedPairs} / ${gameState.totalPairs}`;
}

// 检查游戏是否结束
function checkGameEnd() {
    if (gameState.matchedPairs === gameState.totalPairs) {
        clearInterval(gameState.timerInterval);
        
        // 播放胜利音效
        winSound.currentTime = 0;
        winSound.play();
        
        // 显示胜利消息
        setTimeout(() => {
            finalStatsElement.textContent = `用时: ${gameState.timer}秒, 移动次数: ${gameState.moves}`;
            messageElement.style.display = 'block';
            overlayElement.style.display = 'block';
        }, 500);
    }
}

// 事件监听器
startButton.addEventListener('click', () => {
    initGame();
    startGame();
});

resetButton.addEventListener('click', initGame);

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        gameState.currentLevel = button.dataset.level;
        initGame();
    });
});

closeMessageButton.addEventListener('click', () => {
    messageElement.style.display = 'none';
    overlayElement.style.display = 'none';
});

// 初始化游戏
initGame();