// ======================================
// FCM BARCA
// DEVELOPED BY HWTA
// ======================================

const gameData = {
    club: "FC Barcelona",
    season: "2026/2027",
    coins: 1000000,
    chemistry: 0,
    currentPage: "home"
};

const pages = {
    squad: "تشكيلة برشلونة",
    laliga: "الدوري الإسباني",
    ucl: "دوري أبطال أوروبا",
    transfers: "سوق الانتقالات",
    academy: "أكاديمية برشلونة",
    training: "مركز التدريب",
    rewards: "الجوائز والإنجازات",
    coupons: "قسائم الحظ"
};

// فتح الصفحات
function openPage(page) {
    if (!pages[page]) return;

    gameData.currentPage = page;

    document.getElementById("game").classList.add("hidden");
    document.getElementById("page-screen").classList.remove("hidden");

    document.getElementById("page-title").textContent = pages[page];

    renderPage(page);
}

// العودة للرئيسية
function goHome() {
    gameData.currentPage = "home";

    document.getElementById("page-screen").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
}

// عرض الصفحات
function renderPage(page) {

    const content = document.getElementById("page-content");

    if (page === "squad") {
        renderSquad();
        return;
    }

    const descriptions = {
        laliga: "الدوري الإسباني 2026-2027",
        ucl: "دوري أبطال أوروبا",
        transfers: "سوق انتقالات اللاعبين",
        academy: "اكتشاف وتطوير المواهب",
        training: "تطوير مهارات اللاعبين",
        rewards: "جوائز الموسم",
        coupons: "عجلة الحظ والأساطير"
    };

    content.innerHTML = `
        <div class="section-card">
            <h2>${pages[page]}</h2>
            <p>${descriptions[page]}</p>
            <div class="coming-soon">
                SYSTEM UNDER DEVELOPMENT
            </div>
        </div>
    `;
}

// عرض تشكيلة برشلونة
function renderSquad() {

    const content = document.getElementById("page-content");

    const positions = [
        "ALL",
        "GK",
        "DEF",
        "MID",
        "ATT"
    ];

    content.innerHTML = `
        <div class="squad-header">
            <h2>FC BARCELONA</h2>
            <p>FIRST TEAM | 2026/27</p>
            <div class="squad-info">
                <span>👥 ${barcaPlayers.length} لاعب</span>
                <span>🪙 ${gameData.coins.toLocaleString()}</span>
            </div>
        </div>

        <div class="position-filters">
            ${positions.map(pos => `
                <button onclick="filterPlayers('${pos}')">
                    ${pos}
                </button>
            `).join("")}
        </div>

        <div id="players-grid" class="players-grid"></div>
    `;

    filterPlayers("ALL");
}

// تصنيف اللاعبين
function filterPlayers(position) {

    let players = barcaPlayers;

    if (position === "GK") {
        players = players.filter(p => p.position === "GK");
    }

    if (position === "DEF") {
        players = players.filter(p =>
            ["CB", "LB", "RB", "LWB", "RWB"].includes(p.position)
        );
    }

    if (position === "MID") {
        players = players.filter(p =>
            ["CM", "CDM", "CAM"].includes(p.position)
        );
    }

    if (position === "ATT") {
        players = players.filter(p =>
            ["ST", "LW", "RW", "CF"].includes(p.position)
        );
    }

    const grid = document.getElementById("players-grid");

    if (!grid) return;

    grid.innerHTML = players.map(player => `

        <div class="player-card"
             onclick="showPlayer(${player.id})">

            <div class="player-rating">
                ${player.overall}
                <small>${player.position}</small>
            </div>

            <div class="player-image">
                <span>${player.name.split(" ").map(n => n[0]).join("").slice(0,2)}</span>
            </div>

            <div class="player-number">
                #${player.number}
            </div>

            <div class="player-name">
                ${player.name}
            </div>

            <div class="player-value">
                €${(player.value / 1000000).toFixed(1)}M
            </div>

        </div>

    `).join("");
}

// تفاصيل اللاعب
function showPlayer(id) {

    const player = barcaPlayers.find(p => p.id === id);

    if (!player) return;

    const content = document.getElementById("page-content");

    content.innerHTML = `

        <button class="back-button" onclick="renderSquad()">
            ← العودة للتشكيلة
        </button>

        <div class="player-details">

            <div class="player-rating-large">
                ${player.overall}
                <span>${player.position}</span>
            </div>

            <h1>${player.name}</h1>

            <h3>FC BARCELONA | #${player.number}</h3>

            <div class="player-stats">

                <div>
                    <span>التقييم</span>
                    <strong>${player.overall}</strong>
                </div>

                <div>
                    <span>الإمكانات</span>
                    <strong>${player.potential}</strong>
                </div>

                <div>
                    <span>القيمة السوقية</span>
                    <strong>€${(player.value / 1000000).toFixed(1)}M</strong>
                </div>

            </div>

            <div class="player-actions">
                <button onclick="addToLineup(${player.id})">
                    إضافة للتشكيلة
                </button>
            </div>

        </div>
    `;
}

// إضافة اللاعب للتشكيلة
function addToLineup(id) {

    const player = barcaPlayers.find(p => p.id === id);

    alert("تم اختيار " + player.name);

}

// الحفظ
function saveGame() {
    localStorage.setItem(
        "FCM_BARCA_SAVE",
        JSON.stringify({
            coins: gameData.coins,
            chemistry: gameData.chemistry
        })
    );
}

// التحميل
function loadGame() {

    try {
        const saved = JSON.parse(
            localStorage.getItem("FCM_BARCA_SAVE")
        );

        if (saved) {
            gameData.coins = saved.coins ?? 1000000;
            gameData.chemistry = saved.chemistry ?? 0;
        }
    } catch (error) {
        console.error("Save loading error:", error);
    }

    document.getElementById("coins").textContent =
        gameData.coins.toLocaleString();
}

setInterval(saveGame, 5000);

loadGame();

console.log("FCM BARCA ENGINE READY");
console.log("DEVELOPED BY HWTA");
