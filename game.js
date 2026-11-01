// ========================================
// FCM BARCA
// FOOTBALL CAREER MANAGER
// DEVELOPED BY HWTA
// ========================================

"use strict";

const SAVE_KEY = "FCM_BARCA_HWTA_V1";

// فرق الدوري الإسباني
const laLigaTeams = [
    "Real Madrid",
    "Atletico Madrid",
    "Girona",
    "Athletic Bilbao",
    "Real Sociedad",
    "Villarreal",
    "Sevilla",
    "Valencia",
    "Real Betis",
    "Osasuna",
    "Celta Vigo",
    "Getafe",
    "Espanyol",
    "Mallorca",
    "Rayo Vallecano",
    "Alaves",
    "Elche",
    "Levante",
    "Real Oviedo"
];

// فرق دوري الأبطال
const uclTeams = [
    "Manchester City",
    "Real Madrid",
    "Bayern Munich",
    "Paris Saint-Germain",
    "Liverpool",
    "Arsenal",
    "Inter Milan",
    "AC Milan",
    "Borussia Dortmund",
    "Juventus",
    "Atletico Madrid",
    "Chelsea"
];

// التشكيلات
const formations = {
    "4-3-3": [
        [50,90],[17,72],[39,77],[61,77],[83,72],
        [32,50],[50,57],[68,50],
        [17,20],[50,12],[83,20]
    ],

    "4-2-3-1": [
        [50,90],[17,72],[39,77],[61,77],[83,72],
        [38,57],[62,57],
        [17,30],[50,32],[83,30],[50,12]
    ],

    "4-4-2": [
        [50,90],[17,72],[39,77],[61,77],[83,72],
        [17,48],[39,52],[61,52],[83,48],
        [36,15],[64,15]
    ],

    "3-4-3": [
        [50,90],[28,76],[50,78],[72,76],
        [15,48],[38,53],[62,53],[85,48],
        [20,17],[50,12],[80,17]
    ]
};

// تجهيز اللاعبين
const defaultPlayers = barcaPlayers.map((p, i) => ({
    ...p,
    id: p.id || i + 1,
    starter: i < 11,
    goals: 0,
    assists: 0,
    form: 7.0
}));

// بيانات اللعبة
const initialGame = {
    coins: 500,
    energy: 100,
    coupons: 0,

    players: defaultPlayers,

    academy: [
        {id:101,name:"Iker Moreno",position:"CM",rating:68,price:2},
        {id:102,name:"Alex Ruiz",position:"ST",rating:66,price:2},
        {id:103,name:"Dani Costa",position:"CB",rating:65,price:2},
        {id:104,name:"Lucas Garcia",position:"RW",rating:67,price:3}
    ],

    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    couponsClaimed: ""
};

let game = JSON.parse(JSON.stringify(initialGame));

let currentMatch = null;
let matchMinute = 0;
let selectedPlayer = null;
let currentFormation = "4-3-3";

let marketPlayers = [
    {name:"Jude Bellingham",position:"AM",rating:91,price:110},
    {name:"Nico Williams",position:"LW",rating:87,price:75},
    {name:"Erling Haaland",position:"ST",rating:92,price:140},
    {name:"Florian Wirtz",position:"AM",rating:90,price:105},
    {name:"Vitinha",position:"CM",rating:88,price:80},
    {name:"William Saliba",position:"CB",rating:88,price:90},
    {name:"Takefusa Kubo",position:"RW",rating:85,price:55},
    {name:"Mikel Merino",position:"CM",rating:85,price:45},
    {name:"Mohamed Salah",position:"RW",rating:89,price:60},
    {name:"Bukayo Saka",position:"RW",rating:89,price:100}
];

// ========================================
// حفظ وتحميل اللعبة
// ========================================

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            game = {
                ...initialGame,
                ...data
            };

            if (!Array.isArray(game.players)) {
                game.players = JSON.parse(JSON.stringify(defaultPlayers));
            }

            if (!Array.isArray(game.academy)) {
                game.academy = [];
            }
        }
    } catch (error) {
        console.error("Save error:", error);
        game = JSON.parse(JSON.stringify(initialGame));
    }
}

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch (error) {
        console.error("Save error:", error);
    }

    updateResources();
}

// ========================================
// الموارد
// ========================================

function updateResources() {
    const coins = document.getElementById("coins");
    const energy = document.getElementById("energy");
    const coupons = document.getElementById("coupon-count");

    if (coins) coins.textContent = game.coins;
    if (energy) energy.textContent = game.energy;
    if (coupons) coupons.textContent = game.coupons;

    const rating = document.getElementById("team-rating");

    if (rating) {
        rating.textContent = getTeamRating();
    }
}

// ========================================
// تقييم الفريق والتناغم
// ========================================

function getTeamRating() {
    const starters = game.players
        .filter(p => p.starter)
        .slice(0, 11);

    if (!starters.length) return 0;

    const total = starters.reduce(
        (sum, player) => sum + Number(player.rating || 0),
        0
    );

    return Math.round(total / starters.length);
}

function getChemistry() {
    const starters = game.players
        .filter(p => p.starter)
        .slice(0, 11);

    if (!starters.length) return 0;

    let chemistry = 65;

    const positions = starters.map(p => p.position);

    if (positions.filter(p => p === "CM").length >= 2) {
        chemistry += 8;
    }

    if (positions.filter(p => p === "CB").length >= 2) {
        chemistry += 5;
    }

    if (positions.includes("ST")) {
        chemistry += 5;
    }

    if (starters.length === 11) {
        chemistry += 10;
    }

    return Math.min(99, chemistry);
}

// ========================================
// التنقل بين الصفحات
// ========================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    renderAll();
}

// ========================================
// بطاقات اللاعبين
// ========================================

function createPlayerCard(player, action = "") {
    const initials = String(player.name || "?")
        .split(" ")
        .map(x => x[0])
        .join("")
        .slice(0, 2);

    return `
        <div class="player-card">

            <div class="player-photo">
                ${initials}
            </div>

            <div class="player-rating">
                ${player.rating}
            </div>

            <h3>${player.name}</h3>

            <p>${player.position}</p>

            <p>السعر: ${player.price}M €</p>

            <p>التقييم: ${player.form || 7.0}</p>

            ${action}

        </div>
    `;
}

// ========================================
// التشكيلة
// ========================================

function renderSquad() {
    const list = document.getElementById("players-list");

    if (!list) return;

    list.innerHTML = game.players.map(player => {

        const button = player.starter
            ? `<button onclick="removeFromLineup(${player.id})">
                إلى الدكة
               </button>`
            : `<button onclick="addToLineup(${player.id})">
                إلى التشكيلة
               </button>`;

        return createPlayerCard(player, button);

    }).join("");

    renderPitch();
}

function renderPitch() {
    const pitch = document.getElementById("football-pitch");

    if (!pitch) return;

    const starters = game.players
        .filter(p => p.starter)
        .slice(0, 11);

    const positions = formations[currentFormation];

    pitch.innerHTML = starters.map((player, index) => {

        const position = positions[index] || [50,50];

        return `
            <button
                class="pitch-player"
                style="
                    left:${position[0]}%;
                    top:${position[1]}%;
                "
                onclick="selectPitchPlayer(${player.id})">

                ${player.name.split(" ").slice(-1)[0]}

            </button>
        `;

    }).join("");
}

function selectPitchPlayer(id) {
    if (selectedPlayer === null) {
        selectedPlayer = id;

        alert("اختر اللاعب الآخر لتبديل مكانيهما.");

        return;
    }

    if (selectedPlayer === id) {
        selectedPlayer = null;
        return;
    }

    const player1 = game.players.find(p => p.id === selectedPlayer);
    const player2 = game.players.find(p => p.id === id);

    if (player1 && player2) {
        const temp = player1.starter;

        player1.starter = player2.starter;
        player2.starter = temp;
    }

    selectedPlayer = null;

    saveGame();
    renderSquad();
}

function addToLineup(id) {
    const player = game.players.find(p => p.id === id);

    if (!player || player.starter) return;

    const starters = game.players.filter(p => p.starter);

    if (starters.length >= 11) {
        const outgoing = starters[0];

        if (outgoing) outgoing.starter = false;
    }

    player.starter = true;

    saveGame();
    renderSquad();
}

function removeFromLineup(id) {
    const player = game.players.find(p => p.id === id);

    if (!player || !player.starter) return;

    const substitute = game.players.find(p => !p.starter);

    if (!substitute) {
        alert("لا يوجد لاعب بديل.");
        return;
    }

    player.starter = false;
    substitute.starter = true;

    saveGame();
    renderSquad();
}

// ========================================
// الدوري الإسباني
// ========================================

function renderLeague() {
    const table = document.getElementById("league-table");

    if (!table) return;

    const teams = ["Barcelona", ...laLigaTeams];

    table.innerHTML = teams.map((team, index) => {

        const points = index === 0
            ? game.wins * 3 + game.draws
            : Math.max(0, 30 - index * 2);

        return `
            <div class="row">
                <b>${index + 1}. ${team}</b>
                <span>${points} نقطة</span>
            </div>
        `;

    }).join("");
}

// ========================================
// دوري الأبطال
// ========================================

function renderUCL() {
    const container = document.getElementById("ucl-teams");

    if (!container) return;

    container.innerHTML = uclTeams.map(team => `
        <div class="panel">
            <h3>${team}</h3>
            <button onclick="startMatch('${team}','ucl')">
                مواجهة
            </button>
        </div>
    `).join("");
}

// ========================================
// سوق الانتقالات
// ========================================

function renderMarket() {
    const container = document.getElementById("market-players");

    if (!container) return;

    container.innerHTML = marketPlayers.map((player, index) => `
        <div class="player-card">

            <h3>${player.name}</h3>

            <p>${player.position}</p>

            <p>التقييم: ${player.rating}</p>

            <p>السعر: ${player.price}M €</p>

            <button onclick="buyPlayer(${index})">
                شراء اللاعب
            </button>

        </div>
    `).join("");
}

function buyPlayer(index) {
    const player = marketPlayers[index];

    if (!player) return;

    if (game.coins < player.price) {
        alert("لا تملك عملات كافية.");
        return;
    }

    game.coins -= player.price;

    game.players.push({
        ...player,
        id: Date.now(),
        starter: false,
        goals: 0,
        assists: 0,
        form: 7.0
    });

    marketPlayers.splice(index, 1);

    saveGame();
    renderAll();

    alert("تم التعاقد مع اللاعب بنجاح!");
}

function sellPlayer(id) {
    const player = game.players.find(p => p.id === id);

    if (!player) return;

    if (player.starter) {
        alert("أخرج اللاعب من التشكيلة أولاً.");
        return;
    }

    game.coins += Math.max(1, player.price);

    game.players = game.players.filter(p => p.id !== id);

    saveGame();
    renderAll();

    alert("تم بيع اللاعب.");
}

// ========================================
// الأكاديمية
// ========================================

function renderAcademy() {
    const container = document.getElementById("academy-players");

    if (!container) return;

    container.innerHTML = game.academy.map(player => `
        <div class="player-card">

            <h3>${player.name}</h3>

            <p>${player.position}</p>

            <p>التقييم: ${player.rating}</p>

            <button onclick="developYouth(${player.id})">
                تطوير اللاعب
            </button>

            <button onclick="promotePlayer(${player.id})">
                تصعيد للفريق
            </button>

        </div>
    `).join("");
}

function developYouth(id) {
    const player = game.academy.find(p => p.id === id);

    if (!player) return;

    if (game.coins < 20) {
        alert("تحتاج إلى 20 عملة.");
        return;
    }

    game.coins -= 20;

    player.rating = Math.min(99, player.rating + 2);

    saveGame();
    renderAcademy();

    alert("تم تطوير اللاعب!");
}

function promotePlayer(id) {
    const player = game.academy.find(p => p.id === id);

    if (!player) return;

    game.players.push({
        id: Date.now(),
        name: player.name,
        position: player.position,
        rating: player.rating,
        price: player.price,
        starter: false,
        goals: 0,
        assists: 0,
        form: 7.0
    });

    game.academy = game.academy.filter(p => p.id !== id);

    saveGame();
    renderAll();

    alert("تم تصعيد اللاعب إلى الفريق الأول!");
}

// ========================================
// المباريات
// ========================================

function startMatch(opponent, competition = "league") {
    if (currentMatch) {
        alert("هناك مباراة جارية بالفعل.");
        return;
    }

    const starters = game.players.filter(p => p.starter);

    if (starters.length !== 11) {
        alert("يجب أن يكون لديك 11 لاعباً أساسياً.");
        return;
    }

    if (game.energy < 10) {
        alert("لا توجد طاقة كافية لخوض المباراة.");
        return;
    }

    game.energy -= 10;

    currentMatch = {
        opponent: opponent,
        competition: competition,
        homeGoals: 0,
        awayGoals: 0,
        events: [],
        scorers: []
    };

    matchMinute = 0;

    const title = document.getElementById("match-details");

    if (title) {
        title.textContent = "Barcelona vs " + opponent;
    }

    const score = document.getElementById("match-score");

    if (score) {
        score.textContent = "Barcelona 0 - 0 " + opponent;
    }

    const clock = document.getElementById("match-clock");

    if (clock) clock.textContent = "0'";

    const map = document.getElementById("match-map");

    if (map) {
        map.innerHTML = `
            <div class="panel">
                <h2>مباراة برشلونة</h2>
                <p>المنافس: ${opponent}</p>
                <p>استعد للمباراة!</p>
            </div>
        `;
    }

    saveGame();
    showPage("match");
}

function advanceMatch() {
    if (!currentMatch) return;

    if (matchMinute >= 9) {
        finishMatch();
        return;
    }

    matchMinute++;

    const strength = getTeamRating() + getChemistry() / 5;

    const opponentStrength = 78 + Math.random() * 15;

    const homeChance = Math.random() * strength / 100;
    const awayChance = Math.random() * opponentStrength / 150;

    if (homeChance > 0.65) {
        currentMatch.homeGoals++;

        const scorers = game.players.filter(p => p.starter);

        if (scorers.length) {
            const scorer = scorers[
                Math.floor(Math.random() * scorers.length)
            ];

            scorer.goals++;

            currentMatch.scorers.push(scorer.name);

            currentMatch.events.push(
                matchMinute + "' هدف لبرشلونة - " + scorer.name
            );
        }
    }

    if (awayChance > 0.78) {
        currentMatch.awayGoals++;

        currentMatch.events.push(
            matchMinute + "' هدف للمنافس"
        );
    }

    const score = document.getElementById("match-score");

    if (score) {
        score.textContent =
            "Barcelona " +
            currentMatch.homeGoals +
            " - " +
            currentMatch.awayGoals +
            " " +
            currentMatch.opponent;
    }

    const clock = document.getElementById("match-clock");

    if (clock) clock.textContent = matchMinute * 10 + "'";

    const details = document.getElementById("match-details");

    if (details) {
        details.innerHTML = currentMatch.events.length
            ? currentMatch.events.map(e => `<p>${e}</p>`).join("")
            : "المباراة مستمرة...";
    }

    if (matchMinute >= 9) {
        finishMatch();
    }
}

function toggleBench() {
    const bench = document.getElementById("substitutes");

    if (!bench) return;

    bench.style.display =
        bench.style.display === "none" ? "block" : "none";

    bench.innerHTML = game.players
        .filter(p => !p.starter)
        .map(p => `
            <button onclick="substitutePlayer(${p.id})">
                ${p.name}
            </button>
        `).join("");
}

function substitutePlayer(id) {
    const incoming = game.players.find(p => p.id === id);

    if (!incoming || incoming.starter) return;

    const starters = game.players.filter(p => p.starter);

    const outgoing = prompt(
        "اكتب اسم اللاعب الأساسي الذي تريد إخراجه:\n" +
        starters.map(p => p.name).join("\n")
    );

    if (!outgoing) return;

    const player = starters.find(
        p => p.name.toLowerCase() === outgoing.toLowerCase()
    );

    if (!player) {
        alert("لم يتم العثور على اللاعب.");
        return;
    }

    player.starter = false;
    incoming.starter = true;

    saveGame();
    renderSquad();
    toggleBench();
}

// ========================================
// نهاية المباراة
// ========================================

function finishMatch() {
    if (!currentMatch) return;

    const home = currentMatch.homeGoals;
    const away = currentMatch.awayGoals;

    game.played++;

    if (home > away) {
        game.wins++;
        game.coins += 100;
    } else if (home === away) {
        game.draws++;
        game.coins += 50;
    } else {
        game.losses++;
        game.coins += 25;
    }

    game.players.forEach(player => {
        if (player.starter) {
            player.form = Math.min(
                10,
                Math.max(5, Number(player.form || 7) + (Math.random() - 0.4))
            );

            if (player.form >= 8.5 && Math.random() > 0.7) {
                player.rating = Math.min(99, player.rating + 1);
                player.price += 2;
            }
        }
    });

    const finalScore = document.getElementById("final-score");

    if (finalScore) {
        finalScore.textContent =
            "Barcelona " + home + " - " + away + " " +
            currentMatch.opponent;
    }

    const star = document.getElementById("match-star");

    if (star) {
        const best = [...game.players]
            .filter(p => p.starter)
            .sort((a,b) => b.form - a.form)[0];

        star.textContent = best
            ? "نجم المباراة: " + best.name
            : "نجم المباراة: Barcelona";
    }

    const scorers = document.getElementById("match-scorers");

    if (scorers) {
        scorers.innerHTML = currentMatch.scorers.length
            ? currentMatch.scorers.map(name => `<p>⚽ ${name}</p>`).join("")
            : "<p>لم يسجل برشلونة أهدافاً.</p>";
    }

    const details = document.getElementById("match-details");

    if (details) {
        details.innerHTML = `
            <p>المسابقة: ${currentMatch.competition}</p>
            <p>الأحداث:</p>
            ${currentMatch.events.map(e => `<p>${e}</p>`).join("")}
        `;
    }

    saveGame();

    currentMatch = null;

    showPage("result");
}

// ========================================
// التدريب
// ========================================

function renderTraining() {
    const container = document.getElementById("training-content");

    if (!container) return;

    container.inne
