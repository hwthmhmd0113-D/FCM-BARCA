// =================================
// FCM BARCA - BY HWTA
// MAIN GAME ENGINE
// =================================

const gameData = {
    club: "FC Barcelona",
    season: "2026/2027",
    coins: 1000000,
    chemistry: 0,
    currentPage: "home"
};

// أسماء الصفحات
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

// الانتقال إلى صفحة
function openPage(page) {

    if (!pages[page]) return;

    gameData.currentPage = page;

    document.getElementById("game").classList.add("hidden");

    const screen = document.getElementById("page-screen");
    screen.classList.remove("hidden");

    document.getElementById("page-title").textContent =
        pages[page];

    renderPage(page);
}

// العودة للرئيسية
function goHome() {

    gameData.currentPage = "home";

    document.getElementById("page-screen").classList.add("hidden");

    document.getElementById("game").classList.remove("hidden");
}

// عرض محتوى الصفحات
function renderPage(page) {

    const content = document.getElementById("page-content");

    const descriptions = {
        squad: "إدارة اللاعبين والتشكيلات ومراكز اللعب.",
        laliga: "بطولة الدوري الإسباني 2026-2027.",
        ucl: "رحلتك نحو المجد الأوروبي.",
        transfers: "اشترِ اللاعبين وابنِ فريق الأحلام.",
        academy: "اكتشف المواهب وصعّد اللاعبين للفريق الأول.",
        training: "طوّر مهارات لاعبي برشلونة.",
        rewards: "تابع الجوائز والإنجازات الموسمية.",
        coupons: "اجمع القسائم واحصل على أساطير برشلونة."
    };

    content.innerHTML = `
        <div class="section-card">
            <div class="section-icon">🔵🔴</div>
            <h2>${pages[page]}</h2>
            <p>${descriptions[page]}</p>
            <div class="coming-soon">
                SYSTEM UNDER DEVELOPMENT
            </div>
        </div>
    `;
}

// حفظ تقدم اللعبة
function saveGame() {

    localStorage.setItem(
        "FCM_BARCA_SAVE",
        JSON.stringify(gameData)
    );
}

// تحميل التقدم
function loadGame() {

    const saved = localStorage.getItem("FCM_BARCA_SAVE");

    if (saved) {

        const data = JSON.parse(saved);

        Object.assign(gameData, data);
    }

    document.getElementById("coins").textContent =
        gameData.coins.toLocaleString();
}

// حفظ تلقائي
setInterval(saveGame, 5000);

// تشغيل اللعبة
loadGame();

console.log("FCM BARCA ENGINE STARTED");
console.log("DEVELOPED BY HWTA");
