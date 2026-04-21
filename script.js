// =========================================
// 1. REFERENSI ELEMENT HTML
// =========================================
const loginPage = document.getElementById('login-page');
const mainUi = document.getElementById('main-ui');
const gameplayPage = document.getElementById('gameplay-page');
const deckEditorPage = document.getElementById('deck-editor-page');

// Navigasi Layar Utama
const btnStart = document.getElementById('btn-start');
const btnExit = document.getElementById('btn-exit');
const btnGoBattle = document.getElementById('btn-go-battle');
const btnBackToUi = document.getElementById('btn-back-to-ui');
const btnBackToLogin = document.getElementById('btn-back-to-login');

// Navigasi Deck Editor
const btnOpenDeckEditor = document.getElementById('btn-open-deck-editor');
const btnBackFromDeck = document.getElementById('btn-back-from-deck');
const editorActiveDeck = document.getElementById('editor-active-deck');
const editorCollection = document.getElementById('editor-collection');
const deckCountInfo = document.getElementById('deck-count-info');

// Area Gameplay
const phaseBanner = document.getElementById('phase-banner');
const phaseIndicator = document.getElementById('phase-indicator');
const btnPhaseAction = document.getElementById('btn-phase-action');

const playerHandDiv = document.getElementById('player-hand');
const playerFieldDiv = document.getElementById('player-field');
const enemyHandDiv = document.getElementById('enemy-hand');
const enemyFieldDiv = document.getElementById('enemy-field');

// =========================================
// 2. DATABASE GLOBAL KARTU & STORY
// =========================================
const GLOBAL_DATABASE = [
    { id: 1, name: "Slash", cost: 1, type: "Normal", damage: 10, char: "Umum" },
    { id: 2, name: "Stab", cost: 1, type: "Normal", damage: 12, char: "Umum" },
    { id: 3, name: "Fireball", cost: 2, type: "Spesial", damage: 30, char: "Mage" },
    { id: 4, name: "Heavy Strike", cost: 2, type: "Spesial", damage: 25, char: "Warrior" },
    { id: 5, name: "Holy Smite", cost: 3, type: "Spesial", damage: 45, char: "Paladin" }, 
    { id: 6, name: "Poison Dart", cost: 1, type: "Normal", damage: 15, char: "Rogue" },
    { id: 7, name: "Dragon Breath", cost: 3, type: "Spesial", damage: 50, char: "Dragonborn" },
    { id: 8, name: "Slash", cost: 1, type: "Normal", damage: 10, char: "Umum" },
    { id: 9, name: "Stab", cost: 1, type: "Normal", damage: 12, char: "Umum" },
    { id: 10, name: "Fireball", cost: 2, type: "Spesial", damage: 30, char: "Mage" },
    { id: 11, name: "Heavy Strike", cost: 2, type: "Spesial", damage: 25, char: "Warrior" }
];

let playerCollection = [...GLOBAL_DATABASE]; 
let activeDeck = [];

// =========================================
// 3. VARIABEL STATE BATTLE & FASE
// =========================================
let currentMana = 3;
let playerHP = 100;
let enemyHP = 100;
let isPlayerTurn = true;
let currentPhase = 'DRAW'; 
let cardsOnField = [];

// =========================================
// 4. FUNGSI UTAMA & UI
// =========================================
function showScreen(screenToShow) {
    loginPage.classList.add('hidden');
    mainUi.classList.add('hidden');
    gameplayPage.classList.add('hidden');
    deckEditorPage.classList.add('hidden');
    screenToShow.classList.remove('hidden');
}

function updateUI() {
    document.getElementById('player-mana').innerText = currentMana;
    document.getElementById('player-hp').innerText = playerHP;
    document.getElementById('enemy-hp').innerText = enemyHP;
}

// Fungsi Bantuan Pembuat Fisik Kartu
function createCardHTML(cardData, isMini = false) {
    const el = document.createElement('div');
    el.classList.add('card');
    if (isMini) el.classList.add('mini-card');

    el.innerHTML = `
        <div class="card-title">${cardData.name}</div>
        <div class="card-type">[${cardData.type}]<br><span style="font-size:0.6rem; color:#ccc;">${cardData.char}</span></div>
        <div class="card-stats" style="margin-top: auto;">
            <span class="cost">💎 ${cardData.cost}</span>
            <span class="damage">⚔️ ${cardData.damage}</span>
        </div>
    `;
    return el;
}

// =========================================
// 5. LOGIKA DECK EDITOR
// =========================================
function renderDeckEditor() {
    editorActiveDeck.innerHTML = '';
    editorCollection.innerHTML = '';
    deckCountInfo.innerText = `Cards: ${activeDeck.length}/10`;

    if (activeDeck.length >= 10) {
        editorCollection.classList.add('collection-locked');
        deckCountInfo.style.color = "#e74c3c"; 
    } else {
        editorCollection.classList.remove('collection-locked');
        deckCountInfo.style.color = "#f1c40f"; 
    }

    playerCollection.forEach((cardData, index) => {
        const cardEl = createCardHTML(cardData, true);
        cardEl.onclick = () => addCardToDeck(index);
        editorCollection.appendChild(cardEl);
    });

    activeDeck.forEach((cardData, index) => {
        const cardEl = createCardHTML(cardData, true);
        cardEl.onclick = () => removeCardFromDeck(index);
        editorActiveDeck.appendChild(cardEl);
    });
}

function addCardToDeck(collectionIndex) {
    if (activeDeck.length >= 10) return; 
    const selectedCard = playerCollection.splice(collectionIndex, 1)[0];
    activeDeck.push(selectedCard); 
    renderDeckEditor(); 
}

function removeCardFromDeck(deckIndex) {
    const removedCard = activeDeck.splice(deckIndex, 1)[0];
    playerCollection.push(removedCard);
    renderDeckEditor();
}

// =========================================
// 6. ANIMASI FASE BATTLE
// =========================================
function announcePhase(text, callback) {
    phaseBanner.innerText = text;
    phaseBanner.classList.remove('phase-banner-hidden');
    phaseBanner.classList.add('phase-banner-active');
    btnPhaseAction.disabled = true;

    setTimeout(() => {
        phaseBanner.classList.remove('phase-banner-active');
        phaseBanner.classList.add('phase-banner-hidden');
        if (callback) callback();
    }, 1500); 
}

// =========================================
// 7. LOGIKA BATTLE (PEMAIN)
// =========================================
function startPlayerTurnSequence() {
    isPlayerTurn = true;
    currentMana = 3;
    updateUI();
    
    announcePhase("DRAW PHASE", () => {
        drawNewCards();
        setTimeout(() => {
            announcePhase("MAIN PHASE", () => {
                currentPhase = 'MAIN';
                phaseIndicator.innerText = "PHASE: MAIN PHASE";
                phaseIndicator.style.color = "#f1c40f";
                
                btnPhaseAction.disabled = false;
                btnPhaseAction.innerText = "Go to Battle Phase";
                btnPhaseAction.style.opacity = "1";
            });
        }, 500);
    });
}

function drawNewCards() {
    if (activeDeck.length === 0) return;

    const normalCards = activeDeck.filter(c => c.type === "Normal");
    const specialCards = activeDeck.filter(c => c.type === "Spesial");

    let randSpecial = specialCards.length > 0 ? specialCards[Math.floor(Math.random() * specialCards.length)] : activeDeck[Math.floor(Math.random() * activeDeck.length)];
    let randNormal1 = normalCards.length > 0 ? normalCards[Math.floor(Math.random() * normalCards.length)] : activeDeck[Math.floor(Math.random() * activeDeck.length)];
    let randNormal2 = normalCards.length > 0 ? normalCards[Math.floor(Math.random() * normalCards.length)] : activeDeck[Math.floor(Math.random() * activeDeck.length)];

    const cardsToDraw = [randSpecial, randNormal1, randNormal2];

    cardsToDraw.forEach(cardData => {
        if (playerHandDiv.children.length >= 10) return; 
        const cardElement = createCardHTML(cardData, false);
        cardElement.onclick = () => playCard(cardData, cardElement);
        playerHandDiv.appendChild(cardElement);
    });
}

function playCard(cardData, cardElement) {
    if (!isPlayerTurn) return;
    if (currentPhase !== 'MAIN') {
        alert("Kamu hanya bisa menaruh kartu di Main Phase!");
        return;
    }

    if (currentMana >= cardData.cost) {
        currentMana -= cardData.cost;
        cardsOnField.push(cardData); 
        updateUI(); 
        
        playerFieldDiv.appendChild(cardElement);
        cardElement.classList.add('played-card'); 
        cardElement.onclick = () => cancelCard(cardData, cardElement);
    } else {
        alert(`Mana tidak cukup!`);
    }
}

function cancelCard(cardData, cardElement) {
    if (!isPlayerTurn) return;
    if (currentPhase !== 'MAIN') {
        alert("Kartu tidak bisa ditarik kembali saat Battle Phase!");
        return;
    }

    currentMana += cardData.cost;
    const cardIndex = cardsOnField.indexOf(cardData);
    if (cardIndex > -1) { cardsOnField.splice(cardIndex, 1); }
    updateUI();

    playerHandDiv.appendChild(cardElement);
    cardElement.classList.remove('played-card');
    cardElement.onclick = () => playCard(cardData, cardElement);
}

// =========================================
// 8. LOGIKA STATE MACHINE TOMBOL FASE
// =========================================
btnPhaseAction.addEventListener('click', () => {
    if (!isPlayerTurn) return;

    if (currentPhase === 'MAIN') {
        announcePhase("BATTLE PHASE", () => {
            currentPhase = 'BATTLE';
            phaseIndicator.innerText = "PHASE: BATTLE PHASE";
            phaseIndicator.style.color = "#e74c3c"; 
            
            btnPhaseAction.disabled = false;
            btnPhaseAction.innerText = (cardsOnField.length > 0) ? "Execute Attack!" : "Skip Battle & End Turn";
        });
    } 
    else if (currentPhase === 'BATTLE') {
        let totalDamage = 0;
        cardsOnField.forEach(card => totalDamage += card.damage);
        
        enemyHP -= totalDamage;
        if(enemyHP < 0) enemyHP = 0;
        updateUI();

        if (enemyHP <= 0) {
            alert("KAMU MENANG!");
            btnBackToUi.click();
            return;
        }

        announcePhase("END PHASE", () => {
            currentPhase = 'END';
            phaseIndicator.innerText = "PHASE: END PHASE";
            phaseIndicator.style.color = "#95a5a6"; 
            
            btnPhaseAction.disabled = false;
            btnPhaseAction.innerText = "Confirm End Turn";
            
            playerFieldDiv.innerHTML = '';
            cardsOnField = [];
        });
    }
    else if (currentPhase === 'END') {
        startEnemyTurnSequence();
    }
});

// =========================================
// 9. LOGIKA BATTLE (MUSUH / AI)
// =========================================
function drawEnemyCards(amount) {
    for(let i=0; i<amount; i++) {
        if (enemyHandDiv.children.length >= 10) break;
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'card-back');
        enemyHandDiv.appendChild(cardElement);
    }
}

function startEnemyTurnSequence() {
    isPlayerTurn = false;
    currentPhase = 'ENEMY';
    
    phaseIndicator.innerText = "PHASE: ENEMY TURN";
    phaseIndicator.style.color = "#c0392b";
    
    btnPhaseAction.disabled = true;
    btnPhaseAction.innerText = "Enemy Turn...";
    btnPhaseAction.style.opacity = "0.5";

    announcePhase("ENEMY DRAW", () => {
        drawEnemyCards(3);
        
        setTimeout(() => {
            announcePhase("ENEMY MAIN", () => {
                processEnemyAI(() => {
                    if (playerHP <= 0) {
                        setTimeout(() => {
                            alert("KAMU KALAH!");
                            btnBackToUi.click();
                        }, 500);
                        return;
                    }

                    setTimeout(() => {
                        announcePhase("ENEMY END", () => {
                            enemyFieldDiv.innerHTML = '';
                            startPlayerTurnSequence(); 
                        });
                    }, 1000);
                });
            });
        }, 500);
    });
}

function processEnemyAI(onComplete) {
    let enemyMana = 3;
    
    function playNext() {
        const playable = GLOBAL_DATABASE.filter(c => c.cost <= enemyMana);
        if (enemyMana > 0 && enemyHandDiv.children.length > 0 && playable.length > 0) {
            
            const cardData = playable[Math.floor(Math.random() * playable.length)];
            const randomIndex = Math.floor(Math.random() * enemyHandDiv.children.length);
            const cardEl = enemyHandDiv.children[randomIndex];
            
            enemyFieldDiv.appendChild(cardEl);
            cardEl.classList.remove('card-back');
            cardEl.classList.add('played-card');
            
            cardEl.innerHTML = `
                <div class="card-title">${cardData.name}</div>
                <div class="card-type">[${cardData.type}]<br><span style="font-size:0.6rem; color:#ccc;">${cardData.char}</span></div>
                <div class="card-stats" style="margin-top: auto;">
                    <span class="cost">💎 ${cardData.cost}</span>
                    <span class="damage">⚔️ ${cardData.damage}</span>
                </div>
            `;
            
            playerHP -= cardData.damage;
            enemyMana -= cardData.cost;
            if(playerHP < 0) playerHP = 0;
            updateUI();
            
            setTimeout(playNext, 800); 
        } else {
            onComplete();
        }
    }
    playNext();
}

// =========================================
// 10. EVENT LISTENERS GLOBAL
// =========================================
btnStart.addEventListener('click', () => showScreen(mainUi));
btnBackToLogin.addEventListener('click', () => showScreen(loginPage));

btnOpenDeckEditor.addEventListener('click', () => {
    showScreen(deckEditorPage);
    renderDeckEditor();
});

btnBackFromDeck.addEventListener('click', () => {
    showScreen(mainUi);
});

btnExit.addEventListener('click', () => {
    if(confirm("Mau keluar dari game?")) window.location.reload(); 
});

btnGoBattle.addEventListener('click', () => {
    if (activeDeck.length === 0) {
        alert("Deck kamu tidak boleh kosong! Bikin deck dulu.");
        return;
    }

    showScreen(gameplayPage);
    playerHP = 100;
    enemyHP = 100;
    cardsOnField = [];
    
    playerFieldDiv.innerHTML = ''; 
    enemyFieldDiv.innerHTML = ''; 
    playerHandDiv.innerHTML = '';
    enemyHandDiv.innerHTML = '';
    
    drawEnemyCards(3); // Inisiasi tangan musuh sebelum mulai
    startPlayerTurnSequence();
});

btnBackToUi.addEventListener('click', () => {
    if (confirm("Are you sure want to quit?")) {
        showScreen(mainUi);
        playerFieldDiv.innerHTML = ''; 
        playerHandDiv.innerHTML = '';  
        enemyFieldDiv.innerHTML = ''; 
        enemyHandDiv.innerHTML = ''; 
    }
});