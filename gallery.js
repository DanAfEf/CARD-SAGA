// =========================================
// DATABASE MUSUH & SISTEM GALLERY
// =========================================

const ENEMIES_DB = [
    { name: "Gifa", hp: 100, desc: "Debuff: Pemain kehilangan 5 Mana di awal pertarungan.", image: "img/gifa.png" },
    { name: "Daft", hp: 100, desc: "Buff: Serangan musuh memiliki 20% ekstra Damage.", image: "img/daft.png" },
    { name: "Venox", hp: 100, desc: "Debuff: Pemain terkena Poison, kehilangan 5 HP tiap awal turn.", image: "img/venox.png" },
    { name: "Aegis", hp: 120, desc: "Buff: Memiliki Shield, menerima 50% lebih sedikit Damage.", image: "img/aegis.png" },
    { name: "Sylph", hp: 80, desc: "Buff: Regen 10 HP di setiap akhir giliran musuh.", image: "img/sylph.png" }
];

const GALLERY_STORAGE_KEY = 'cardSaga_unlockedEnemies';

function getUnlockedEnemies() {
    const data = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch(e) {
            return [];
        }
    }
    return [];
}

function isEnemyUnlocked(enemyName) {
    const unlocked = getUnlockedEnemies();
    return unlocked.includes(enemyName);
}

function unlockEnemy(enemyName) {
    const unlocked = getUnlockedEnemies();
    if (!unlocked.includes(enemyName)) {
        unlocked.push(enemyName);
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(unlocked));
    }
}

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    ENEMIES_DB.forEach(enemy => {
        const isUnlocked = isEnemyUnlocked(enemy.name);
        
        const cardEl = document.createElement('div');
        cardEl.classList.add('gallery-card');
        
        if (!isUnlocked) {
            cardEl.classList.add('locked-enemy');
            cardEl.innerHTML = `
                <img src="${enemy.image}" alt="???">
                <div class="gallery-name">???</div>
            `;
        } else {
            cardEl.innerHTML = `
                <img src="${enemy.image}" alt="${enemy.name}">
                <div class="gallery-name">${enemy.name}</div>
            `;
            // Interaksi hanya bisa dilakukan jika sudah di-unlock
            cardEl.onclick = () => {
                showEnemyDetails(enemy);
            };
        }
        
        galleryGrid.appendChild(cardEl);
    });
}

function showEnemyDetails(enemy) {
    const modal = document.getElementById('gallery-modal');
    document.getElementById('modal-img').src = enemy.image;
    document.getElementById('modal-name').innerText = enemy.name;
    document.getElementById('modal-hp').innerText = `HP: ${enemy.hp}`;
    document.getElementById('modal-desc').innerText = enemy.desc;
    
    modal.classList.remove('hidden');
}

function closeEnemyDetails() {
    document.getElementById('gallery-modal').classList.add('hidden');
}
