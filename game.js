// =====================================
// FCM BARCA - TACTICAL ENGINE
// DEVELOPED BY HWTA
// =====================================

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

// التشكيلة الأساسية
let lineup = [
    1, 5, 7, 11, 8,
    22, 15, 18,
    14, 20, 21
];

// مراكز اللاعبين في الملعب
const pitchPositions = [
    {x:50, y:90, role:"GK"},
    {x:18, y:70, role:"LB"},
    {x:39, y:73, role:"CB"},
    {x:61, y:73, role:"CB"},
    {x:82, y:70, role:"RB"},

    {x:25, y:48, role:"CM"},
    {x:50, y:43, role:"CM"},
    {x:75, y:48, role:"CM"},

    {x:18, y:20, role:"LW"},
    {x:50, y:14, role:"ST"},
    {x:82, y:20, role:"RW"}
];

let selectedSlot = null;

// =====================================
// NAVIGATION
// =====================================

function openPage(page) {

    if (!pages[page]) return;

    gameData.currentPage = page;

    document.getElementById("game").classList.add("hidden");

    document.getElementById("page-screen").classList.remove("hidden");

    document.getElementById("page-title").textContent = pages[page];

    renderPage(page);
}

function goHome() {

    gameData.currentPage = "home";

    document.getElementById("page-screen").classList.add("hidden");

    document.getElementById("game").classList.remove("hidden");

}

// =====================================
// PAGE RENDERING
// =====================================

function renderPage(page) {

    if (page === "squad") {
        renderSquad();
        return;
    }

    const descriptions = {
        laliga: "الدوري الإسباني 2026-2027",
        ucl: "دوري أبطال أوروبا",
        transfers: "سوق انتقالات اللاعبين",
        academy: "أكاديمية برشلونة",
        training: "مركز التدريب",
        rewards: "جوائز الموسم",
        coupons: "عجلة الحظ والأساطير"
    };

    document.getElementById("page-content").innerHTML = `
        <div class="section-card">
            <h2>${pages[page]}</h2>
            <p>${descriptions[page]}</p>
            <div class="coming-soon">
                SYSTEM UNDER DEVELOPMENT
            </div>
        </div>
    `;
}

// =====================================
// SQUAD
// =====================================

function renderSquad() {

    const content = document.getElementById("page-content");

    content.innerHTML = `

        <div class="squad-header">

            <h2>FC BARCELONA</h2>

            <p>FIRST TEAM | 2026/27</p>

            <div class="squad-info">
                <span>👥 ${barcaPlayers.length} لاعب</span>
                <span>🪙 ${gameData.coins.toLocaleString()}</span>
            </div>

        </div>

        <div class="tactical-section">

            <div class="tactical-header">

                <h2>⚽ الخطة التكتيكية</h2>

                <span>4-3-3</span>

            </div>

            <div class="chemistry-box">

                <span>تناغم الفريق</span>

                <span class="chemistry-value" id="chemistry-value">
                    0
                </span>

            </div>

            <div class="pitch" id="pitch">

                <div class="pitch-box top"></div>
                <div class="pitch-box bottom"></div>

            </div>

            <p class="pitch-instructions">
                اضغط على لاعب ثم اضغط على لاعب آخر لتبديل مركزيهما.
            </p>

            <div id="selected-player-info"></div>

            <div id="assignment-list"></div>

        </div>

        <h2 style="margin:25px 0 15px;color:#f5c542">
            قائمة لاعبي برشلونة
        </h2>

        <div class="position-filters">

            <button onclick="filterPlayers('ALL')">الكل</button>
            <button onclick="filterPlayers('GK')">الحراس</button>
            <button onclick="filterPlayers('DEF')">الدفاع</button>
            <button onclick="filterPlayers('MID')">الوسط</button>
            <button onclick="filterPlayers('ATT')">الهجوم</button>

        </div>

        <div id="players-grid" class="players-grid"></div>

    `;

    renderPitch();
    filterPlayers("ALL");
    calculateChemistry();
}

// =====================================
// PITCH
// =====================================

function renderPitch() {

    const pitch = document.getElementById("pitch");

    if (!pitch) return;

    pitch.querySelectorAll(".pitch-slot").forEach(el => el.remove());

    pitchPositions.forEach((position, index) => {

        const player = barcaPlayers.find(
            p => p.id === lineup[index]
        );

        const slot = document.createElement("div");

        slot.className = "pitch-slot";

        if (selectedSlot === index) {
            slot.classList.add("selected");
        }

        slot.style.left = position.x + "%";
        slot.style.top = position.y + "%";

        slot.innerHTML = `

            <div class="pitch-player">
                ${player ? player.overall : "+"}
            </div>

            <span>
                ${player ? player.name.split(" ").slice(-1)[0] : "فارغ"}
            </span>

        `;

        slot.onclick = () => selectPitchPlayer(index);

        pitch.appendChild(slot);

    });

}

// =====================================
// SELECT AND SWAP PLAYERS
// =====================================

function selectPitchPlayer(index) {

    if (selectedSlot === null) {

        selectedSlot = index;

        const player = barcaPlayers.find(
            p => p.id === lineup[index]
        );

        document.getElementById("selected-player-info").innerHTML = `
            <div class="chemistry-box">
                اللاعب المحدد: ${player ? player.name : "مركز فارغ"}
                <button onclick="showAssignmentList()">
                    تغيير اللاعب
                </button>
            </div>
        `;

    } else if (selectedSlot === index) {

        selectedSlot = null;

        document.getElementById("selected-player-info").innerHTML = "";

    } else {

        const temp = lineup[selectedSlot];

        lineup[selectedSlot] = lineup[index];

        lineup[index] = temp;

        selectedSlot = null;

        document.getElementById("selected-player-info").innerHTML = "";

        saveGame();

    }

    renderPitch();
    calculateChemistry();

}

// =====================================
// ASSIGN NEW PLAYER
// =====================================

function showAssignmentList() {

    if (selectedSlot === null) return;

    const box = document.getElementById("assignment-list");

    box.innerHTML = `

        <h3 style="margin:15px 0;color:#f5c542">
            اختر اللاعب البديل
        </h3>

        <div class="players-grid">

            ${barcaPlayers.map(player => `

                <button class="player-card"
                    onclick="assignPlayer(${player.id})">

                    <div class="player-rating">
                        ${player.overall}
                    </div>

                    <div class="player-image">
                        <span>
                            ${player.name.substring(0,2)}
                        </span>
                    </div>

                    <div class="player-name">
                        ${player.name}
                    </div>

                    <div class="player-number">
                        ${player.position}
                    </div>

                </button>

            `).join("")}

        </div>

    `;

}

function assignPlayer(id) {

    if (selectedSlot === null) return;

    const existingIndex = lineup.indexOf(id);

    if (existingIndex !== -1) {

        const temp = lineup[selectedSlot];

        lineup[selectedSlot] = lineup[existingIndex];

        lineup[existingIndex] = temp;

    } else {

        lineup[selectedSlot] = id;

    }

    selectedSlot = null;

    document.getElementById("assignment-list").innerHTML = "";

    document.getElementById("selected-player-info").innerHTML = "";

    renderPitch();

    calculateChemistry();

    saveGame();

}

// =====================================
// CHEMISTRY
// =====================================

function calculateChemistry() {

    let total = 0;

    lineup.forEach((id, index) => {

        const player = barcaPlayers.find(p => p.id === id);

        if (!player) return;

        const role = pitchPositions[index].role;

        if (player.position === role) {
            total += 10;
        }

        else if (
            (role === "CM" && ["CDM","CAM"].includes(player.position)) ||
            (role === "CB" && ["LB","RB"].includes(player.position)) ||
            (role === "ST" && ["CF","LW","RW"].includes(player.position)) ||
            (role === "LW" && player.position === "RW") ||
            (role === "RW" && player.position === "LW")
        ) {
            total += 7;
        }

        else {
            total += 3;
        }

    });

    gameData.chemistry = Math.round(total / 11);

    const element = document.getElementById("chemistry-value");

    if (element) {
        element.textContent = gameData.chemistry + "/100";
    }

}

// =====================================
// PLAYER FILTERS
// =====================================

function filterPlayers(position) {

    let players = barcaPlayers;

    if (position === "GK") {
        players = players.filter(p => p.position === "GK");
    }

    if (position === "DEF") {
        players = players.filter(p =>
            ["CB","LB","RB"].includes(p.position)
        );
    }

    if (position === "MID") {
        players = players.filter(p =>
            ["CM","CDM","CAM"].includes(p.position)
        );
    }

    if (position === "ATT") {
        players = players.filter(p =>
            ["ST","LW","RW","CF"].includes(p.position)
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
                <span>
                    ${player.name.substring(0,2)}
                </span>
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

// =====================================
// PLAYER DETAILS
// =====================================

function showPlayer(id) {

    const player = barcaPlayers.find(p => p.id === id);

    if (!player) return;

    document.getElementById("page-content").innerHTML = `

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
                    <strong>€${(player.value/1000000).toFixed(1)}M</strong>
                </div>

            </div>

        </div>

    `;

}

// =====================================
// SAVE SYSTEM
// =====================================

function saveGame() {

    localStorage.setItem(
        "FCM_BARCA_SAVE",
        JSON.stringify({
            coins: gameData.coins,
            chemistry: gameData.chemistry,
            lineup: lineup
        })
    );

}

function loadGame() {

    try {

        const saved = JSON.parse(
            localStorage.getItem("FCM_BARCA_SAVE")
        );

        if (saved) {

            gameData.coins = saved.coins ?? 1000000;

            gameData.chemistry = saved.chemistry ?? 0;

            if (
                Array.isArray(saved.lineup) &&
                saved.lineup.length === 11 &&
                saved.lineup.every(id =>
                    barcaPlayers.some(p => p.id === id)
                ) &&
                new Set(saved.lineup).size === 11
            ) {
                lineup = saved.lineup;
            }

        }

    } catch(error) {

        console.log("Save loading error", error);

    }

    document.getElementById("coins").textContent =
        gameData.coins.toLocaleString();

}

setInterval(saveGame, 5000);

loadGame();

console.log("FCM BARCA TACTICAL ENGINE READY");
console.log("DEVELOPED BY HWTA");
