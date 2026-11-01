// ==========================================
// FCM BARCA - GAME ENGINE
// CREATED BY HWTA
// ==========================================

// إعدادات الحفظ
const SAVE_KEY = "FCM_BARCA_HWTA_V1";

// بيانات الفرق
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

// اللاعبين
const defaultPlayers = barcaPlayers.map((p, i) => ({
    ...p,
    starter: i < 11,
    goals: 0,
    assists: 0,
    form: 7.0
}));

// بيانات اللعبة
let game = {
    coins: 500,
    energy: 100,
    coupons: 0,
    players: defaultPlayers,
    academy: [
        {id: 101, name: "Iker Moreno", position: "CM", rating: 68, price: 2},
        {id: 102, name: "Alex Ruiz", position: "ST", rating: 66, price: 2},
        {id: 103, name: "Dani Costa", position: "CB", rating: 65, price: 2},
        {id: 104, name: "Lucas Garcia", position: "RW", rating: 67, price: 3}
    ],
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    couponsClaimed: ""
};

let selectedPlayer = null;
let currentMatch = null;
let matchMinute = 0;
let currentFormation = "4-3-3";
let matchTimer = null;

// تحميل الحفظ
function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            game = {
                ...game,
                ...data
            };
        }
    } catch (error) {
        console.log("Save loading error:", error);
    }
}

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    updateResources();
}

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

    const chemistryElement = document.getElementById("chemistry");

    if (chemistryElement) {
        chemistryElement.textContent = getChemistry() + "%";
    }
}

// التنقل بين الصفحات
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    renderAll();
    window.scrollTo(0, 0);
}

// حساب قوة الفريق
function getTeamRating() {
    const starters = game.players.filter(p => p.starter);

    if (!starters.length) return 0;

    const total = starters.reduce((sum, p) => {
        return sum + p.rating;
    }, 0);

    return Math.round(total / starters.length);
}

// حساب التناغم
function getChemistry() {
    const starters = game.players.filter(p => p.starter);

    if (starters.length === 0) return 0;

    let chemistry = 65;

    const positions = starters.map(p => p.position);

    const counts = {};

    positions.forEach(pos => {
        counts[pos] = (counts[pos] || 0) + 1;
    });

    if (counts.CM >= 2) chemistry += 8;
    if (counts.CB >= 2) chemistry += 5;
    if (counts.RW && counts.LW) chemistry += 5;
    if (counts.ST) chemistry += 5;

    if (starters.length === 11) chemistry += 10;

    return Math.min(99, chemistry);
}

// عرض بطاقات اللاعبين
function createPlayerCard(player, action = "") {
    return `
        <div class="player-card">

            <div class="player-photo">
                ${player.name.split(" ").map(x => x[0]).join("").slice(0, 2)}
            </div>

            <div class="player-rating">
                ${player.rating}
            </div>

            <h3>${player.name}</h3>

            <p>
                ${player.position}
                |
                ${player.price}M €
            </p>

            <p>الحالة: ${player.form || 7.0}</p>

            ${action}

        </div>
    `;
}

// عرض التشكيلة
function renderSquad() {
    const list = document.getElementById("players-list");

    if (!list) return;

    list.innerHTML = game.players.map(player => {

        const action = player.starter
            ? `<button onclick="removeFromLineup(${player.id})">إلى الدكة</button>`
            : `<button onclick="addToLineup(${player.id})">إلى التشكيلة</button>`;

        return createPlayerCard(player, action);

    }).join("");

    renderPitch();
}

// مواقع اللاعبين على الملعب
const formations = {
    "4-3-3": [
        [50, 90],
        [17, 72],
        [39, 77],
        [61, 77],
        [83, 72],
        [32, 50],
        [50, 57],
        [68, 50],
        [17, 20],
        [50, 12],
        [83, 20]
    ],

    "4-2-3-1": [
        [50, 90],
        [17, 72],
        [39, 77],
        [61, 77],
        [83, 72],
        [38, 57],
        [62, 57],
        [17, 30],
        [50, 32],
        [83, 30],
        [50, 12]
    ],

    "4-4-2": [
        [50, 90],
        [17, 72],
        [39, 77],
        [61, 77],
        [83, 72],
        [17, 48],
        [39, 52],
        [61, 52],
        [83, 48],
        [36, 15],
        [64, 15]
    ],

    "3-4-3": [
        [50, 90],
        [28, 76],
        [50, 78],
        [72, 76],
        [15, 48],
        [38, 53],
        [62, 53],
        [85, 48],
        [20, 17],
        [50, 12],
        [80, 17]
    ]
};

function renderPitch() {
    const pitch = document.getElementById("football-pitch");

    if (!pitch) return;

    const starters = game.players.filter(p => p.starter).slice(0, 11);

    const coordinates = formations[currentFormation] || formations["4-3-3"];

    pitch.innerHTML = starters.map((player, index) => {

        const position = coordinates[index] || [50, 50];

        return `
            <button
                class="pitch-player"
                style="left:${position[0]}%;top:${position[1]}%"
                onclick="selectPitchPlayer(${player.id})">

                ${player.name.split(" ").slice(-1)[0].slice(0, 7)}

            </button>
        `;

    }).join("");
}

// تغيير التشكيلة
document.addEventListener("DOMContentLoaded", () => {

    const formation = document.getElementById("formation");

    if (formation) {
        formation.addEventListener("change", function() {
            currentFormation = this.value;
            renderPitch();
        });
    }

});

function selectPitchPlayer(id) {

    if (selectedPlayer === null) {
        selectedPlayer = id;

        alert("اختر اللاعب الآخر لتبديل المركز.");
        return;
    }

    if (selectedPlayer === id) {
        selectedPlayer = null;
        return;
    }

    const first = game.players.find(p => p.id === selectedPlayer);
    const second = game.players.find(p => p.id === id);

    if (first && second) {
        const temp = first.starter;

        first.starter = second.starter;
        second.starter = temp;
    }

    selectedPlayer = null;

    saveGame();
    renderSquad();
}

// إضافة لاعب للتشكيلة
function addToLineup(id) {
    const starters = game.players.filter(p => p.starter);

    if (starters.length >= 11) {
        alert("التشكيلة مكتملة. أخرج لاعباً أولاً.");
        return;
    }

    const player = game.players.find(p => p.id === id);

    if (player) {
        player.starter = true;
    }

    saveGame();
    renderSquad();
}

// إخراج لاعب من التشكيلة
function removeFromLineup(id) {
    const starters = game.players.filter(p => p.starter);

    if (starters.length <= 11) {
        alert("أخرج لاعباً آخر أولاً أو أضف بديلاً قبل تغيير العدد.");
        return;
    }

    const player = game.players.find(p => p.id === id);

    if (player) {
        player.starter = false;
    }

    saveGame();
    renderSquad();
}

// جدول الدوري
function renderLeague() {
    const table = document.getElementById("league-table");

    if (!table) return;

    const teams = ["Barcelona", ...laLigaTeams];

    table.innerHTML = teams.map((team, index) => {

        let points = index === 0
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

// دوري الأبطال
function renderUCL() {
    const container = document.getElementById("ucl-teams");

    if (!container) return;

    container.innerHTML = uclTeams.map(team => `
        <div class="panel">
            <h3>⭐ ${team}</h3>
            <small>نادي مشارك</small>
        </div>
    `).join("");
}

// سوق الانتقالات
const transferMarket = [
    {name: "Jude Bellingham", position: "AM", rating: 91, price: 110},
    {name: "Nico Williams", position: "LW", rating: 87, price: 75},
    {name: "Erling Haaland", position: "ST", rating: 92, price: 140},
    {name: "Florian Wirtz", position: "AM", rating: 90, price: 105},
    {name: "Vitinha", position: "CM", rating: 88, price: 80},
    {name: "William Saliba", position: "CB", rating: 88, price: 90},
    {name: "Takefusa Kubo", position: "RW", rating: 85, price: 55},
    {name: "Mikel Merino", position: "CM", rating: 85, price: 45},
    {name: "Mohamed Salah", position: "RW", rating: 89, price: 60},
    {name: "Bukayo Saka", position: "RW", rating: 89, price: 100}
];

function renderMarket() {
    const container = document.getElementById("market-players");

    if (!container) return;

    container.innerHTML = transferMarket.map((player, index) => {

        return createPlayerCard(
            player,
            `<button onclick="buyPlayer(${index})">شراء اللاعب</button>`
        );

    }).join("");
}

// شراء لاعب
function buyPlayer(index) {
    const player = transferMarket[index];

    if (!player) return;

    if (game.coins < player.price) {
        alert("رصيدك لا يكفي لشراء هذا اللاعب.");
        return;
    }

    if (game.players.some(p => p.name === player.name)) {
        alert("هذا اللاعب موجود بالفعل في فريقك.");
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

    saveGame();
    renderAll();

    alert("تم التعاقد مع " + player.name);
}

// بيع لاعب
function sellPlayer(id) {
    const player = game.players.find(p => p.id === id);

    if (!player) return;

    if (player.starter) {
        alert("أخرج اللاعب من التشكيلة أولاً.");
        return;
    }

    const price = Math.max(1, Math.round(player.price * 0.85));

    game.coins += price;

    game.players = game.players.filter(p => p.id !== id);

    saveGame();
    renderAll();
}

// الأكاديمية
function renderAcademy() {
    const container = document.getElementById("academy-players");

    if (!container) return;

    container.innerHTML = game.academy.map((player, index) => {

        return `
            <div class="player-card">

                <div class="player-photo">🌱</div>

                <div class="player-rating">${player.rating}</div>

                <h3>${player.name}</h3>

                <p>${player.position}</p>

                <button onclick="promotePlayer(${index})">
                    تصعيد للفريق الأول
                </button>

                <button onclick="developYouth(${index})">
                    تطوير اللاعب
                </button>

            </div>
        `;

    }).join("");
}

// تطوير لاعب الأكاديمية
function developYouth(index) {
    const player = game.academy[index];

    if (!player) return;

    player.rating += 1;
    player.price += 1;

    saveGame();
    renderAcademy();

    alert("تطور اللاعب وأصبح تقييمه " + player.rating);
}

// تصعيد لاعب
function promotePlayer(index) {
    const player = game.academy[index];

    if (!player) return;

    if (game.players.length >= 35) {
        alert("قائمة الفريق ممتلئة.");
        return;
    }

    game.players.push({
        id: Date.now(),
        name: player.name,
        position: player.position,
        rating: player.rating,
        price: player.price,
        starter: false,
        goals: 0,
        assists: 0,
        form: 7.0,
        pace: 70,
        shooting: 65,
        passing: 65,
        dribbling: 65,
        defending: 60,
        physical: 65
    });

    game.academy.splice(index, 1);

    saveGame();
    renderAll();

    alert("تم تصعيد اللاعب إلى الفريق الأول.");
}

// بدء مباراة
function startMatch(type) {

    if (game.energy < 10) {
        alert("طاقة الفريق غير كافية.");
        return;
    }

    if (game.players.filter(p => p.starter).length !== 11) {
        alert("يجب أن تحتوي التشكيلة على 11 لاعباً.");
        return;
    }

    game.energy -= 10;

    const opponentList = type === "league"
        ? laLigaTeams
        : uclTeams;

    const opponent = opponentList[
        Math.floor(Math.random() * opponentList.length)
    ];

    currentMatch = {
        type: type,
        opponent: opponent,
        goalsFor: 0,
        goalsAgainst: 0,
        events: [],
        scorers: [],
        minute: 0
    };

    matchMinute = 0;

    const title = document.getElementById("match-title");

    title.textContent = type === "league"
        ? "الدوري الإسباني"
        : "دوري أبطال أوروبا";

    const score = document.getElementById("match-score");

    score.innerHTML = `
        <h1>BAR 0 - 0 ${opponent}</h1>
        <p id="match-clock">00:00 / 09:00</p>
    `;

    document.getElementById("match-details").textContent =
        "انطلقت المباراة. استعد للمنافسة!";

    document.getElementById("match-ball").style.left = "50%";
    document.getElementById("match-ball").style.top = "50%";

    const substitutes = document.getElementById("substitutes");

    substitutes.innerHTML = `
        <h3>البدلاء</h3>
        ${game.players.filter(p => !p.starter).map(p => `
            <div class="row">
                <span>${p.name} (${p.position})</span>
                <button onclick="substitutePlayer(${p.id})">إشراك</button>
            </div>
        `).join("")}
    `;

    saveGame();
    showPage("match");
}

// دكة البدلاء
function toggleBench() {
    document.getElementById("substitutes").classList.toggle("hidden");
}

// تبديل اللاعبين
function substitutePlayer(id) {

    const incoming = game.players.find(p => p.id === id);

    if (!incoming || incoming.starter) return;

    const outgoingName = prompt(
        "اكتب اسم اللاعب الأساسي الذي تريد إخراجه:"
    );

    if (!outgoingName) return;

    const outgoing = game.players.find(p =>
        p.starter &&
        p.name.toLowerCase().includes(outgoingName.toLowerCase())
    );

    if (!outgoing) {
        alert("لم يتم العثور على اللاعب.");
        return;
    }

    outgoing.starter = false;
    incoming.starter = true;

    saveGame();

    document.getElementById("match-details").textContent =
        "تم تبديل " + outgoing.name + " بـ " + incoming.name;

    toggleBench();
}

// محاكاة أحداث المباراة
function advanceMatch() {

    if (!currentMatch) return;

    if (matchMinute >= 9) {
        finishMatch();
        return;
    }

    matchMinute++;

    currentMatch.minute = matchMinute;

    const power = getTeamRating();
    const chemistry = getChemistry();

    const chance = Math.random() * 100;

    let event = "تمريرات متبادلة في وسط الملعب.";

    if (chance < 13 + (power + chemistry) / 18) {

        currentMatch.goalsFor++;

        const scorers = game.players.filter(p => p.starter);

        const scorer = scorers[
            Math.floor(Math.random() * scorers.length)
        ];

        scorer.goals++;

        currentMatch.scorers.push(scorer.name);

        event = "⚽ هدف لبرشلونة! سجّل " + scorer.name;

    } else if (chance > 88) {

        currentMatch.goalsAgainst++;

        event = "⚽ هدف للفريق المنافس!";

    } else if (chance > 65) {

        event = "هجمة خطيرة لبرشلونة.";

    } else if (chance > 45) {

        event = "فرصة للفريق المنافس.";

    }

    currentMatch.events.push(event);

    const score = document.getElementById("match-score");

    score.innerHTML = `
        <h1>
            BAR ${currentMatch.goalsFor}
            -
            ${currentMatch.goalsAgainst}
            ${currentMatch.opponent}
        </h1>

        <p>
            ${String(matchMinute).padStart(2, "0")}:00 / 09:00
        </p>
    `;

    document.getElementById("match-details").textContent = event;

    const ball = document.getElementById("match-ball");

    ball.style.left = Math.random() * 85 + 7 + "%";
    ball.style.top = Math.random() * 75 + 10 + "%";

    if (matchMinute >= 9) {
        document.querySelector("#match button.main-button").textContent =
            "إنهاء المباراة";
    }
}

// نهاية المباراة
function finishMatch() {

    if (!currentMatch) return;

    const goals = currentMatch.goalsFor;
    const against = currentMatch.goalsAgainst;

    game.played++;

    if (goals > against) {
        game.wins++;
        game.coins += 80;
    } else if (goals === against) {
        game.draws++;
        game.coins += 35;
    } else {
        game.losses++;
        game.coins += 15;
    }

    // تحديث تقييم اللاعبين
    game.players.filter(p => p.starter).forEach(player => {

        const change = Math.random() > 0.5 ? 1 : -1;

        player.rating = Math.max(
            40,
            Math.min(99, player.rating + change)
        );

        player.form = Math.min(
            10,
            Math.max(5, (player.form || 7) + change * 0.2)
        );

        player.price = Math.max(
            1,
            Math.round(player.price * (1 + change * 0.015))
        );

    });

    document.getElementById("final-score").textContent =
        "BAR " + goals + " - " + against + " " + currentMatch.opponent;

    const bestPlayer = game.players
        .filter(p => p.starter)
        .sort((a, b) => b.rating - a.rating)[0];

    document.getElementById("match-star").textContent =
        bestPlayer ? bestPlayer.name : "برشلونة";

    document.getElementById("match-scorers").textContent =
        currentMatch.scorers.length
        ? "مسجلو الأهداف: " + currentMatch.scorers.join("، ")
        : "لم يسجل برشلونة أهدافاً.";

    document.getElementById("training-content").innerHTML =
        "<p>اختر لاعباً ومهارة لتطويرها بعد المباراة.</p>";

    saveGame();

    currentMatch = null;

    showPage("result");
}

// التدريب
function renderTraining() {

    const container = document.getElementById("training-content");

    if (!container) return;

    container.innerHTML = `
        <p>اختر أحد لاعبي الفريق لتطوير مهارة محددة.</p>

        <select id="training-player">
            ${game.players.map(p => `
                <option value="${p.id}">${p.name}</option>
            `).join("")}
        </select>

        <select id="training-skill">
            <option value="passing">التمرير</option>
            <option value="shooting">التسديد</option>
            <option value="pace">السرعة</option>
            <option value="dribbling">المراوغة</option>
            <option value="defending">الدفاع</option>
            <option value="physical">القوة البدنية</option>
        </select>

        <button onclick="trainPlayer()">بدء التدريب</button>
    `;
}

function trainPlayer() {

    const id = Number(document.getElementById("training-player").value);

    const skill = document.getElementById("training-skill").value;

    const player = game.players.find(p => p.id === id);

    if 
