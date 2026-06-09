// ========== ДАННЫЕ ==========
let userData = {
    bonusBalance: 0,
    loyaltyStatus: "Постоянный",
    streakDays: 0,
    lastCheckinDate: null,
    lastSpinDate: null,
    completedQuests: [],
    leaderboardScore: 0
};

const dailyQuests = [
    { id: 1, title: "Проверить статус залога", reward: 10 },
    { id: 2, title: "Прочитать статью о золоте", reward: 15 },
    { id: 3, title: "Посмотреть калькулятор займа", reward: 10 }
];

const wheelSegments = [
    { label: "10 🪙", value: 10, probability: 0.30 },
    { label: "20 🪙", value: 20, probability: 0.25 },
    { label: "50 🪙", value: 50, probability: 0.15 },
    { label: "100 🪙", value: 100, probability: 0.10 },
    { label: "Скидка 3%", value: "3%", probability: 0.10 },
    { label: "Бейдж 🎖️", value: "Удачливый", probability: 0.10 }
];

let globalLeaderboard = [];

// ========== КАТАЛОГ ПРИЗОВ ==========
const prizesCatalog = [
    { id: 1, name: "Скидка 5% на проценты", icon: "💰", cost: 100, stock: 50 },
    { id: 2, name: "Бесплатное хранение залога (7 дней)", icon: "🏦", cost: 200, stock: 30 },
    { id: 3, name: "Сертификат Wildberries 500₽", icon: "🛍️", cost: 500, stock: 20 },
    { id: 4, name: "Футболка SKS", icon: "👕", cost: 300, stock: 15 },
    { id: 5, name: "Термокружка SKS", icon: "☕", cost: 250, stock: 25 },
    { id: 6, name: "Благотворительный взнос", icon: "🤝", cost: 50, stock: 999 },
    { id: 7, name: "Экскурсия в офис", icon: "🏢", cost: 1000, stock: 5 },
    { id: 8, name: "Золотая монета 1г", icon: "💰", cost: 2000, stock: 3 }
];

let purchasedPrizes = [];

// ========== ВОРОНЁНОК ==========
const mascotPhrases = [
    "Кар-р! Привет! Как дела?",
    "Золото блестит, а ты сегодня сияешь!",
    "Кар! Я Золотце, твой помощник!",
    "Добро пожаловать в SKS Quest! Кар-р!",
    "Выполни квесты — получишь награду!",
    "Кар! Не забывай про ежедневные задания!",
    "Крути колесо удачи! Кар-р!",
    "Кар-р! Я слежу за твоими успехами!",
    "Ты сегодня на высоте! Кар!",
    "Кар-р-р! Ты мой чемпион!"
];

function getRandomPhrase() {
    return mascotPhrases[Math.floor(Math.random() * mascotPhrases.length)];
}

function sayMascot(text, duration = 3000) {
    const bubble = document.getElementById('mascotBubble');
    if (!bubble) return;
    bubble.classList.remove('hidden');
    bubble.textContent = text;
    
    const avatar = document.querySelector('.raven-avatar');
    if (avatar) {
        avatar.style.transform = 'scale(1.05)';
        setTimeout(() => avatar.style.transform = '', 200);
    }
    
    setTimeout(() => {
        bubble.classList.add('hidden');
    }, duration);
}

function randomGreeting() {
    sayMascot(getRandomPhrase(), 3500);
}

// ========== ЗАГРУЗКА ==========
function loadPrizesData() {
    const saved = localStorage.getItem("sks_quest_prizes");
    if (saved) purchasedPrizes = JSON.parse(saved);
}

function savePrizesData() {
    localStorage.setItem("sks_quest_prizes", JSON.stringify(purchasedPrizes));
}

function loadData() {
    const saved = localStorage.getItem("sks_quest_user");
    if (saved) userData = JSON.parse(saved);
    
    const savedLB = localStorage.getItem("sks_quest_leaderboard");
    if (savedLB) globalLeaderboard = JSON.parse(savedLB);
    
    loadPrizesData();
    updateUI();
}

function saveData() {
    localStorage.setItem("sks_quest_user", JSON.stringify(userData));
    updateLeaderboard();
}

function updateLeaderboard() {
    const existing = globalLeaderboard.find(u => u.name === "Алексей");
    if (existing) {
        existing.score = userData.leaderboardScore;
    } else {
        globalLeaderboard.push({ name: "Алексей", score: userData.leaderboardScore, avatar: "🐦‍⬛" });
    }
    globalLeaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("sks_quest_leaderboard", JSON.stringify(globalLeaderboard));
    renderLeaderboard();
}

function renderLeaderboard() {
    const container = document.getElementById("leaderboardList");
    if (!container) return;
    container.innerHTML = "";
    const top10 = globalLeaderboard.slice(0, 10);
    top10.forEach((user, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `${idx+1}. ${user.avatar || "👤"} ${user.name} — ${user.score} 🪙`;
        container.appendChild(li);
    });
}

// ========== UI ==========
function updateUI() {
    document.getElementById("bonusBalance").innerText = userData.bonusBalance;
    document.getElementById("loyaltyStatus").innerText = userData.loyaltyStatus;
    document.getElementById("streakDays").innerText = userData.streakDays;
    
    const progress = Math.min(userData.streakDays, 7);
    document.getElementById("streakProgress").value = progress;
    
    const today = new Date().toDateString();
    const checkinBtn = document.getElementById("checkinBtn");
    if (userData.lastCheckinDate === today) {
        checkinBtn.disabled = true;
        checkinBtn.innerText = "✅ Уже получено";
    } else {
        checkinBtn.disabled = false;
        checkinBtn.innerText = "Забрать 5 бонусов";
    }
    
    const lastSpin = userData.lastSpinDate;
    const spinBtn = document.getElementById("spinBtn");
    if (lastSpin) {
        const daysSince = (new Date() - new Date(lastSpin)) / (1000*60*60*24);
        if (daysSince < 7) {
            spinBtn.disabled = true;
            spinBtn.innerText = `⏳ Через ${Math.ceil(7-daysSince)} дней`;
        } else {
            spinBtn.disabled = false;
            spinBtn.innerText = "🎡 Крутить!";
        }
    } else {
        spinBtn.disabled = false;
        spinBtn.innerText = "🎡 Крутить!";
    }
    
    renderQuests();
    renderPrizes();
}

function renderQuests() {
    const container = document.getElementById("questsList");
    if (!container) return;
    container.innerHTML = "";
    
    dailyQuests.forEach(quest => {
        const completed = userData.completedQuests.includes(quest.id);
        const div = document.createElement("div");
        div.className = `quest-card ${completed ? "completed" : ""}`;
        div.innerHTML = `
            <div>
                <strong>${quest.title}</strong>
                <div class="quest-reward">+${quest.reward} 🪙</div>
            </div>
            ${!completed ? `<button class="complete-btn" data-id="${quest.id}">Выполнить</button>` : "✅"}
        `;
        container.appendChild(div);
    });
    
    document.querySelectorAll(".complete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.dataset.id);
            completeQuest(id);
        });
    });
}

// ========== МЕХАНИКИ ==========
function dailyCheckin() {
    const today = new Date().toDateString();
    if (userData.lastCheckinDate === today) {
        sayMascot("Кар-р! Ты уже забирал сегодня бонусы!");
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let newStreak = (userData.lastCheckinDate === yesterdayStr) ? userData.streakDays + 1 : 1;
    
    userData.bonusBalance += 5;
    userData.leaderboardScore += 5;
    userData.streakDays = newStreak;
    userData.lastCheckinDate = today;
    
    sayMascot(`Кар! +5 бонусов! Теперь у тебя ${userData.bonusBalance} 🪙`);
    
    if (newStreak === 7) {
        userData.bonusBalance += 50;
        userData.leaderboardScore += 50;
        sayMascot("Кар-р-р! Неделя без пропусков! Держи +50 бонусов!");
    } else if (newStreak === 14) {
        userData.bonusBalance += 150;
        userData.leaderboardScore += 150;
        sayMascot("🔥 14 дней! Ты настоящий чемпион! +150 бонусов!");
    }
    
    if (userData.leaderboardScore >= 5000) userData.loyaltyStatus = "VIP";
    else if (userData.leaderboardScore >= 1000) userData.loyaltyStatus = "Золотой";
    
    saveData();
    updateUI();
}

function completeQuest(questId) {
    if (userData.completedQuests.includes(questId)) {
        sayMascot("Кар! Этот квест ты уже сделал сегодня!");
        return;
    }
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest) return;
    
    userData.completedQuests.push(questId);
    userData.bonusBalance += quest.reward;
    userData.leaderboardScore += quest.reward;
    saveData();
    updateUI();
    sayMascot(`Молодец! +${quest.reward} бонусов! Так держать!`);
}

// ========== КОЛЕСО ФОРТУНЫ (РАБОЧАЯ ВЕРСИЯ) ==========
let currentAngle = 0;
let isSpinning = false;

function drawWheel() {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) {
        console.log("Ошибка: canvas не найден!");
        return;
    }
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const centerX = w/2, centerY = h/2;
    const radius = w/2 - 5;
    const angleStep = (Math.PI * 2) / wheelSegments.length;
    
    ctx.clearRect(0, 0, w, h);
    
    for (let i = 0; i < wheelSegments.length; i++) {
        const start = currentAngle + i * angleStep;
        const end = start + angleStep;
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + angleStep/2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(wheelSegments[i].label, radius * 0.7, 8);
        ctx.restore();
    }
    
    // Стрелка
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 10);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 10, 10);
    ctx.fillStyle = "#fff";
    ctx.fill();
}

function spinWheel() {
    console.log("spinWheel вызвана!");
    
    if (isSpinning) {
        sayMascot("Кар! Колесо уже крутится!");
        return;
    }
    
    const lastSpin = userData.lastSpinDate;
    if (lastSpin) {
        const daysSince = (new Date() - new Date(lastSpin)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            sayMascot(`Кар! Колесо только раз в неделю. Осталось ${Math.ceil(7 - daysSince)} дней.`);
            return;
        }
    }
    
    // Выбираем случайный приз
    const rand = Math.random();
    let cumulative = 0;
    let selected = wheelSegments[0];
    for (const seg of wheelSegments) {
        cumulative += seg.probability;
        if (rand < cumulative) {
            selected = seg;
            break;
        }
    }
    
    const spinBtn = document.getElementById("spinBtn");
    spinBtn.disabled = true;
    spinBtn.textContent = "🎡 Крутится...";
    isSpinning = true;
    
    // Анимация вращения
    const startTime = performance.now();
    const duration = 2000;
    const startAngle = currentAngle;
    const fullRotations = 5;
    const targetAngle = startAngle + (Math.PI * 2 * fullRotations);
    
    function animateSpin(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            isSpinning = false;
            
            let resultText = "";
            if (typeof selected.value === "number") {
                userData.bonusBalance += selected.value;
                userData.leaderboardScore += selected.value;
                resultText = `🎉 Выиграли ${selected.value} бонусов!`;
                sayMascot(`Кар-р! ${selected.value} бонусов твои! Поздравляю!`);
                confettiEffect();
            } else {
                resultText = `🎫 ${selected.label}! Обратитесь в филиал.`;
                sayMascot(`Кар! Тебе выпал ${selected.label}. Забери в любом филиале!`);
            }
            
            userData.lastSpinDate = new Date().toISOString();
            saveData();
            updateUI();
            document.getElementById("spinResult").innerHTML = resultText;
            
            spinBtn.disabled = false;
            spinBtn.textContent = "🎡 Крутить (раз в неделю)";
        }
    }
    
    requestAnimationFrame(animateSpin);
}

function confettiEffect() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speed: Math.random() * 5 + 2,
            angle: Math.random() * Math.PI * 2
        });
    }
    
    let animationId;
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let allDead = true;
        
        for (let p of particles) {
            if (p.y < canvas.height) {
                allDead = false;
                p.y += p.speed;
                p.x += Math.sin(p.angle) * 1;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        
        if (allDead) {
            cancelAnimationFrame(animationId);
            document.body.removeChild(canvas);
        } else {
            animationId = requestAnimationFrame(animateConfetti);
        }
    }
    
    animateConfetti();
    setTimeout(() => {
        if (document.body.contains(canvas)) {
            cancelAnimationFrame(animationId);
            document.body.removeChild(canvas);
        }
    }, 3000);
}

// ========== КАТАЛОГ ПРИЗОВ ==========
function renderPrizes() {
    const container = document.getElementById("prizesContainer");
    if (!container) return;
    
    if (prizesCatalog.length === 0) {
        container.innerHTML = '<div class="no-prizes">🎁 Скоро появятся новые призы!</div>';
        return;
    }
    
    container.innerHTML = "";
    
    prizesCatalog.forEach(prize => {
        const purchasedCount = purchasedPrizes.filter(id => id === prize.id).length;
        const stockLeft = prize.stock - purchasedCount;
        const isPurchased = purchasedPrizes.includes(prize.id);
        const available = stockLeft > 0 && !isPurchased;
        
        const card = document.createElement("div");
        card.className = "prize-card";
        card.innerHTML = `
            <div class="prize-icon">${prize.icon}</div>
            <div class="prize-name">${prize.name}</div>
            <div class="prize-cost">💰 <span>${prize.cost}</span> бонусов</div>
            <div class="prize-stock">📦 Осталось: ${stockLeft}</div>
            <button class="buy-btn" data-id="${prize.id}" data-cost="${prize.cost}" data-name="${prize.name}" ${!available ? 'disabled' : ''}>
                ${isPurchased ? '✅ Куплено' : (stockLeft === 0 ? '❌ Нет в наличии' : '🎁 Купить')}
            </button>
        `;
        container.appendChild(card);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const cost = parseInt(btn.dataset.cost);
            const name = btn.dataset.name;
            buyPrize(id, cost, name);
        });
    });
}

function buyPrize(prizeId, cost, prizeName) {
    if (purchasedPrizes.includes(prizeId)) {
        sayMascot("Кар! Ты уже покупал этот приз!");
        return;
    }
    
    const prize = prizesCatalog.find(p => p.id === prizeId);
    const stockLeft = prize.stock - purchasedPrizes.filter(id => id === prizeId).length;
    if (stockLeft <= 0) {
        sayMascot("Кар-р! Этот приз закончился!");
        return;
    }
    
    if (userData.bonusBalance < cost) {
        sayMascot(`Кар! Не хватает бонусов. Нужно ещё ${cost - userData.bonusBalance} 🪙`);
        return;
    }
    
    userData.bonusBalance -= cost;
    purchasedPrizes.push(prizeId);
    saveData();
    savePrizesData();
    renderPrizes();
    updateUI();
    confettiEffect();
    sayMascot(`Кар-р! Ты купил ${prizeName}! Забери в любом филиале! 🎉`);
}

// ========== ЗВУК ==========
function playCawSound() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Кар!");
        utterance.rate = 1;
        utterance.pitch = 1.2;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
}

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    drawWheel();
    document.getElementById("checkinBtn")?.addEventListener("click", dailyCheckin);
    document.getElementById("spinBtn")?.addEventListener("click", spinWheel);
    
    setTimeout(() => {
        sayMascot("Кар-р! Я Золотце, твой воронёнок-помощник! Выполняй квесты и получай бонусы! 💛");
    }, 1000);
    
    const ravenAvatar = document.getElementById("ravenAvatar");
    if (ravenAvatar) {
        ravenAvatar.addEventListener("click", () => {
            playCawSound();
            sayMascot(getRandomPhrase(), 3500);
        });
    }
    
    setInterval(() => {
        const bubble = document.getElementById('mascotBubble');
        if (bubble && bubble.classList.contains('hidden')) {
            if (Math.random() > 0.5) {
                randomGreeting();
            }
        }
    }, 120000);
});