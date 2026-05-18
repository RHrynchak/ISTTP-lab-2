const accountSelector = document.getElementById('accountSelector');
let currentUserId = parseInt(accountSelector.value);

accountSelector.addEventListener('change', () => {
    currentUserId = parseInt(accountSelector.value);
    console.log(`Зміна акаунта на ID: ${currentUserId}`);

    loadListings();
    loadContracts();

    showToast(`Ви увійшли як користувач #${currentUserId}`);
});

// ЛОГІКА ДЛЯ LISTINGS

const listingsGrid = document.getElementById('listingsGrid');
const modal = document.getElementById('createListingModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const closeBtn = document.querySelector('.close-btn');
const createListingForm = document.getElementById('createListingForm');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
    loadContracts();
});

async function loadListings() {
    try {
        const response = await fetch('/api/Listings');
        if (!response.ok) throw new Error('Помилка сервера');

        const listings = await response.json();
        listingsGrid.innerHTML = '';

        if (listings.length === 0) {
            listingsGrid.innerHTML = '<div style="color: #888;">База даних порожня. Створіть перше замовлення!</div>';
            return;
        }

        listings.sort((a, b) => {
            const weightA = statusConfig[a.status] ? statusConfig[a.status].weight : 99;
            const weightB = statusConfig[b.status] ? statusConfig[b.status].weight : 99;
            return weightA - weightB;
        }).forEach(listing => {
            renderListingCard(listing);
        });

    } catch (error) {
        console.error('Помилка:', error);
        listingsGrid.innerHTML = '<div style="color: red;">Помилка завантаження даних.</div>';
    }
}

createListingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newListing = {
        userId: currentUserId,
        type: 0, 
        startMMR: parseInt(document.getElementById('inputStartMMR').value),
        targetMMR: parseInt(document.getElementById('inputTargetMMR').value),
        price: parseInt(document.getElementById('inputPrice').value),
        status: 0, 
        comment: document.getElementById('inputComment').value
    };

    try {
        const response = await fetch('/api/Listings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newListing)
        });

        if (response.ok) {
            closeModal();
            showToast('Замовлення успішно створено!');
            loadListings(); 
            createListingForm.reset(); 
        } else {
            const errorData = await response.json();
            alert('Помилка створення: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Помилка з\'єднання з сервером');
    }
});


const statusConfig = {
    0: { text: 'ВІДКРИТО', color: '#4caf50', weight: 1 },
    'Open': { text: 'ВІДКРИТО', color: '#4caf50', weight: 1 },

    1: { text: 'В РОБОТІ', color: '#ffb300', weight: 2 },
    'InProgress': { text: 'В РОБОТІ', color: '#ffb300', weight: 2 },

    2: { text: 'НА ПАУЗІ', color: '#ff9800', weight: 3 },
    'OnHold': { text: 'НА ПАУЗІ', color: '#ff9800', weight: 3 },

    3: { text: 'ЗАКРИТО', color: '#888888', weight: 4 },
    'Closed': { text: 'ЗАКРИТО', color: '#888888', weight: 4 }
};

const proposalStatusConfig = {
    0: { text: 'ОЧІКУЄ', color: '#ffb300' },
    'Pending': { text: 'ОЧІКУЄ', color: '#ffb300' },

    1: { text: 'ПРИЙНЯТО', color: '#4caf50' },
    'Accepted': { text: 'ПРИЙНЯТО', color: '#4caf50' },

    2: { text: 'ВІДХИЛЕНО', color: '#d32f2f' },
    'Rejected': { text: 'ВІДХИЛЕНО', color: '#d32f2f' }
};

const contractStatusConfig = {
    0: { text: 'В ПРОЦЕСІ', color: '#ffb300' },
    'Active': { text: 'В ПРОЦЕСІ', color: '#ffb300' },

    1: { text: 'ВИКОНАНО', color: '#4caf50' },
    'Completed': { text: 'ВИКОНАНО', color: '#4caf50' },

    2: { text: 'СУПЕРЕЧКА СТОРІН', color: '#ff9800' }, 
    'Disputed': { text: 'СУПЕРЕЧКА СТОРІН', color: '#ff9800' },

    3: { text: 'СКАСОВАНО', color: '#888888' },
    'Canceled': { text: 'СКАСОВАНО', color: '#888888' }
};

async function toggleListingHold(listingId, currentStatus) {
    const newStatus = (currentStatus === 0 || currentStatus === 'Open') ? 2 : 0;

    try {
        const response = await fetch(`/api/Listings/${listingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatus)
        });

        if (response.ok) {
            showToast(newStatus === 2 ? 'Оголошення призупинено' : 'Оголошення знову активне');
            loadListings();
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

function renderListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'card';

    if (listing.status === 3 || listing.status === 'Closed') {
        card.style.opacity = '0.6';
    }

    const authorName = listing.user ? listing.user.username : `Гравець #${listing.userId}`;
    const statusInfo = statusConfig[listing.status] || { text: 'НЕВІДОМО', color: '#fff' };

    const isOwner = listing.userId === currentUserId;
    let actionHTML = '';

    if (isOwner) {
        if (listing.status === 0 || listing.status === 'Open') {
            actionHTML += `<button class="btn btn-warning" onclick="toggleListingHold(${listing.id}, 0)" style="width: 100%; margin-bottom: 15px;">Призупинити пошук (На паузу)</button>`;
        } else if (listing.status === 2 || listing.status === 'OnHold') {
            actionHTML += `<button class="btn btn-accept" onclick="toggleListingHold(${listing.id}, 2)" style="width: 100%; margin-bottom: 15px;">Відновити пошук (Відкрити)</button>`;
        }

        if (listing.proposals && listing.proposals.length > 0) {
            actionHTML += `<div class="proposals-list"><h4>Відгуки бустерів:</h4>`;
            listing.proposals.forEach(p => {
                const boosterName = p.user ? p.user.username : `Бустер #${p.userId}`;

                actionHTML += `
                <div class="proposal-item" style="align-items: flex-start;">
                    <div class="proposal-info" style="flex: 1; padding-right: 15px; word-break: break-word;">
                        <div style="color: #fff;"><strong class="clickable-name" onclick="openUserProfile(${p.userId})">${boosterName}</strong></div>
                        <div style="color: #aaa; margin-top: 4px; font-style: italic;">"${p.comment || 'Без коментаря'}"</div>
                    </div>
                    
                    <div style="text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end;">
                        <div class="proposal-price" style="margin-bottom: 8px;">${p.price} ₴</div>
                        ${(p.status === 0 || p.status === 'Pending') && (listing.status === 0 || listing.status === 'Open') ?
                        `<div style="display: flex; gap: 5px;">
                                <button class="btn btn-accept" onclick="acceptProposal(${p.id}, ${listing.id}, ${p.userId}, ${p.price}, ${listing.startMMR}, ${listing.targetMMR})">Прийняти</button>
                                <button class="btn btn-reject" onclick="rejectProposal(${p.id})" style="margin-left: 0;">Відхилити</button>
                            </div>`
                        : `<span style="font-size:0.8rem; color:#888;">Статус: ${p.status === 2 || p.status === 'Rejected' ? '<span style="color:#d32f2f;">Відхилено</span>' : p.status}</span>`
                    }
                    </div>
                </div>
                `;
            });
            actionHTML += `</div>`;
        } else {
            actionHTML = '<div style="color: #888; font-size: 0.9rem; margin-top: 15px;">Ще немає відгуків.</div>';
        }
    } else {
        const myProposal = listing.proposals ? listing.proposals.find(p => p.userId === currentUserId) : null;

        if (myProposal) {
            const propStatusInfo = proposalStatusConfig[myProposal.status] || { text: 'НЕВІДОМО', color: '#888' };

            actionHTML = `
                <div style="margin-top: 15px; padding: 10px; background-color: #2a2a2a; border-radius: 4px; border-left: 3px solid ${propStatusInfo.color};">
                    <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 5px;">Ваш відгук:</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: var(--gold); font-weight: bold;">${myProposal.price} ₴</span>
                        <span style="background-color: ${propStatusInfo.color}; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">
                            ${propStatusInfo.text}
                        </span>
                    </div>
                    <div style="font-style: italic; font-size: 0.85rem; color: #ccc; margin-bottom: 10px;">"${myProposal.comment || 'Без коментаря'}"</div>
                    
                    ${(myProposal.status === 0 || myProposal.status === 'Pending') ?
                    `<button class="btn btn-danger" style="width: 100%; font-size: 0.8rem;" onclick="deleteProposal(${myProposal.id})">Відкликати пропозицію</button>`
                    : ''
                }
                </div>
            `;
        } else {
            if (listing.status === 0 || listing.status === 'Open') {
                actionHTML = `<button class="btn btn-primary" onclick="openProposalModal(${listing.id})" style="width: 100%; margin-top: 15px;">Відгукнутися</button>`;
            } else {
                actionHTML = `<div style="text-align: center; color: #888; font-size: 0.9rem; padding: 0.6rem 0; margin-top: 15px;">Дія недоступна</div>`;
            }
        }
    }

    card.innerHTML = `
        <div class="card-header">
            <span>${authorName} ${isOwner ? '<span style="color:#888; font-size:0.8rem;">(Ви)</span>' : ''}</span>
            <span class="price">${listing.price} ₴</span>
        </div>
        <div style="margin-bottom: 15px;">
            <span style="background-color: ${statusInfo.color}; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                ${statusInfo.text}
            </span>
        </div>
        <div class="mmr-route">
            <span style="color: #d32f2f;">${listing.startMMR} MMR</span>
            <span>➔</span>
            <span style="color: #4caf50;">${listing.targetMMR} MMR</span>
        </div>
        <div class="comment">"${listing.comment || 'Без коментарів'}"</div>
        
        ${actionHTML}
    `;

    listingsGrid.appendChild(card);
}

btnOpenModal.addEventListener('click', () => modal.classList.add('active'));
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(); 
});

function closeModal() {
    modal.classList.remove('active');
}

function showToast(message) {
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000); // Зникне через 3 секунди
}

// ЛОГІКА ДЛЯ PROPOSALS
const proposalModal = document.getElementById('createProposalModal');
const closeProposalBtn = document.getElementById('closeProposalBtn');
const createProposalForm = document.getElementById('createProposalForm');
const inputProposalListingId = document.getElementById('inputProposalListingId');
const proposalListingIdDisplay = document.getElementById('proposalListingIdDisplay');

function openProposalModal(listingId) {
    inputProposalListingId.value = listingId;
    proposalListingIdDisplay.textContent = listingId;
    proposalModal.classList.add('active');
}

closeProposalBtn.addEventListener('click', () => {
    proposalModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === proposalModal) proposalModal.classList.remove('active');
});

createProposalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProposal = {
        userId: currentUserId,
        listingId: parseInt(inputProposalListingId.value),
        price: parseInt(document.getElementById('inputProposalPrice').value),
        status: 0, 
        comment: document.getElementById('inputProposalComment').value
    };

    try {
        const response = await fetch('/api/Proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProposal)
        });

        if (response.ok) {
            proposalModal.classList.remove('active');
            showToast('Вашу пропозицію успішно надіслано!');
            createProposalForm.reset();
        } else {
            const errorData = await response.json();
            alert('Помилка: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Помилка з\'єднання з сервером');
    }
});

// --- ЛОГІКА ПРИЙНЯТТЯ ПРОПОЗИЦІЇ ТА СТВОРЕННЯ КОНТРАКТУ ---

async function acceptProposal(proposalId, listingId, boosterId, price, startMMR, targetMMR) {
    if (!confirm('Ви впевнені, що хочете довірити свій акаунт цьому гравцю і укласти контракт?')) {
        return;
    }

    try {
        // Змінюємо статус Proposal на Accepted 
        await fetch(`/api/Proposals/${proposalId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(1)
        });

        // Змінюємо статус Listing на InProgress 
        await fetch(`/api/Listings/${listingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(1)
        });

        // Створюємо Contract у базі даних
        const newContract = {
            clientId: currentUserId,
            boosterId: boosterId,
            price: price,
            startMMR: startMMR,
            targetMMR: targetMMR,
            status: 0 // 0 = Active
        };

        const response = await fetch('/api/Contracts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContract)
        });

        if (response.ok) {
            showToast('Контракт успішно укладено!');
            loadListings();
            loadContracts();
        } else {
            const error = await response.json();
            alert('Помилка створення контракту: ' + JSON.stringify(error));
        }

    } catch (error) {
        console.error('Помилка транзакції:', error);
        alert('Сталася помилка з\'єднання з сервером.');
    }
}

// ЛОГІКА ВІДХИЛЕННЯ ПРОПОЗИЦІЇ
async function rejectProposal(proposalId) {
    if (!confirm('Ви впевнені, що хочете відхилити цю пропозицію?')) {
        return;
    }

    try {
        const response = await fetch(`/api/Proposals/${proposalId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(2)
        });

        if (response.ok) {
            showToast('Пропозицію відхилено.');
            loadListings();
        } else {
            const error = await response.json();
            alert('Помилка відхилення: ' + JSON.stringify(error));
        }

    } catch (error) {
        console.error('Помилка:', error);
        alert('Сталася помилка з\'єднання з сервером.');
    }
}

// ЛОГІКА ДЛЯ CONTRACTS
const contractsGrid = document.getElementById('contractsGrid');
const reviewModal = document.getElementById('createReviewModal');
const closeReviewBtn = document.getElementById('closeReviewBtn');
const createReviewForm = document.getElementById('createReviewForm');

async function loadContracts() {
    try {
        const response = await fetch('/api/Contracts');
        if (!response.ok) throw new Error('Помилка сервера');
        const contracts = await response.json();
        contractsGrid.innerHTML = '';
        const myContracts = contracts.filter(c => c.clientId === currentUserId || c.boosterId === currentUserId);
        if (myContracts.length === 0) {
            contractsGrid.innerHTML = '<div style="color: #888;">У вас поки немає активних чи завершених контрактів.</div>';
            return;
        }
        myContracts.forEach(contract => renderContractCard(contract));
    } catch (error) {
        console.error('Помилка:', error);
        contractsGrid.innerHTML = '<div style="color: red;">Помилка завантаження контрактів.</div>';
    }
}

async function updateContractStatus(contractId, newStatus) {
    const actionName = newStatus === 3 ? 'скасувати контракт' : 'відкрити спір щодо контракту';

    if (!confirm(`Ви впевнені, що хочете ${actionName}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/Contracts/${contractId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatus)
        });

        if (response.ok && newStatus === 3) {
            const currentContractResp = await fetch(`/api/Contracts/${contractId}`);
            const currentContract = await currentContractResp.json();
            const listingsResp = await fetch('/api/Listings');
            const allListings = await listingsResp.json();
            const listingToReopen = allListings.find(l =>
                l.userId === currentContract.clientId &&
                (l.status === 1 || l.status === 'InProgress') &&
                l.startMMR === currentContract.startMMR &&
                l.targetMMR === currentContract.targetMMR
            );
            if (listingToReopen) {
                await fetch(`/api/Listings/${listingToReopen.id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(0) 
                });
            }
        }

        if (response.ok) {
            showToast(newStatus === 3 ? 'Контракт скасовано. Оголошення відновлено.' : 'Статус контракту змінено');
            loadContracts();
            loadListings();
        } else {
            alert('Не вдалося оновити статус контракту.');
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

function renderContractCard(contract) {
    const card = document.createElement('div');
    card.className = 'card';

    const statusInfo = contractStatusConfig[contract.status] || { text: 'НЕВІДОМО', color: '#fff' };
    card.style.borderLeftColor = statusInfo.color;

    const boosterName = contract.booster ? contract.booster.username : `Бустер #${contract.boosterId}`;
    const isActive = contract.status === 0 || contract.status === 'Active';

    card.innerHTML = `
        <div class="card-header">
            <span>Контракт #${contract.id}</span>
            <span class="price">${contract.price} ₴</span>
        </div>
        <div style="margin-bottom: 10px; color: #aaa; font-size: 0.9rem;">
            Виконавець: <strong style="color: #fff;">${boosterName}</strong>
        </div>
        
        <div style="margin-bottom: 15px;">
            <span style="background-color: ${statusInfo.color}; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                ${statusInfo.text}
            </span>
        </div>

        <div class="mmr-route">
            <span style="color: #d32f2f;">${contract.startMMR} MMR</span>
            <span>➔</span>
            <span style="color: #4caf50;">${contract.targetMMR} MMR</span>
        </div>
        
        <div style="margin-top: 15px;">
            ${isActive ?
            `<div style="display: flex; flex-direction: column; gap: 8px;">
                    ${contract.clientId === currentUserId ?
                `<button class="btn btn-accept" onclick="openReviewModal(${contract.id}, ${contract.boosterId})" style="width: 100%;">Підтвердити виконання</button>`
                : ''}
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-warning" style="flex: 1;" onclick="updateContractStatus(${contract.id}, 2)">Відкрити спір</button>
                        <button class="btn btn-danger" style="flex: 1;" onclick="updateContractStatus(${contract.id}, 3)">Скасувати</button>
                    </div>
                </div>`
            :
            `<div style="text-align: center; color: #888; font-size: 0.9rem; padding: 0.6rem 0;">Дія недоступна</div>`
        }
        </div>
    `;
    contractsGrid.appendChild(card);
}

// ЛОГІКА ДЛЯ ВІДГУКІВ І ЗАВЕРШЕННЯ КОНТРАКТУ
function openReviewModal(contractId, boosterId) {
    document.getElementById('reviewContractIdDisplay').textContent = contractId;
    document.getElementById('inputReviewContractId').value = contractId;
    document.getElementById('inputReviewBoosterId').value = boosterId;
    reviewModal.classList.add('active');
}

closeReviewBtn.addEventListener('click', () => reviewModal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === reviewModal) reviewModal.classList.remove('active');
});

createReviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const contractId = parseInt(document.getElementById('inputReviewContractId').value);
    const boosterId = parseInt(document.getElementById('inputReviewBoosterId').value);

    try {
        // 1. Оновлюємо статус контракту на Completed 
        await fetch(`/api/Contracts/${contractId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(1)
        });

        // 2. Створюємо відгук
        const newReview = {
            contractId: contractId,
            reviewerId: currentUserId,
            revieweeId: boosterId,
            score: parseInt(document.getElementById('inputReviewScore').value),
            text: document.getElementById('inputReviewText').value
        };

        const response = await fetch('/api/Reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReview)
        });

        // 3. Знаходимо і закриваємо оголошення
        const listingsResp = await fetch('/api/Listings');
        const allListings = await listingsResp.json();

        const currentContractResp = await fetch(`/api/Contracts/${contractId}`);
        const currentContract = await currentContractResp.json();

        const listingToClose = allListings.find(l =>
            l.userId === currentUserId &&
            (l.status === 1 || l.status === 'InProgress') &&
            l.startMMR === currentContract.startMMR &&
            l.targetMMR === currentContract.targetMMR
        );

        if (listingToClose) {
            await fetch(`/api/Listings/${listingToClose.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(3) // 3 = Closed
            });
        }

        if (response.ok) {
            reviewModal.classList.remove('active');
            showToast('Контракт завершено! Оголошення закрито.');
            
            loadContracts(); 
            loadListings(); 
        } else {
            const error = await response.json();
            alert('Помилка збереження відгуку: ' + JSON.stringify(error));
        }

    } catch (error) {
        console.error('Помилка транзакції:', error);
        alert('Помилка з\'єднання з сервером');
    }
});

// --- ЛОГІКА ПЕРЕГЛЯДУ ПРОФІЛЮ ---
const profileModal = document.getElementById('userProfileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');

closeProfileBtn.addEventListener('click', () => profileModal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.classList.remove('active');
});

const positionsMap = {
    1: "Керрі (Pos 1)",
    2: "Мідлайн (Pos 2)",
    3: "Офлайн (Pos 3)",
    4: "Софт-сапорт (Pos 4)",
    5: "Фул-сапорт (Pos 5)"
};

async function openUserProfile(userId) {
    try {
        const response = await fetch(`/api/Users/${userId}`);
        if (!response.ok) throw new Error('Помилка завантаження профілю');

        const user = await response.json();
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileMMR').textContent = user.mmr;

        document.getElementById('profilePosition').textContent = positionsMap[user.preferredPosition] || user.preferredPosition || 'Не вказано';

        const rating = user.ratingAsBooster;
        document.getElementById('profileBoosterRating').textContent = rating > 0 ? rating.toFixed(1) : 'Немає оцінок';

        const reviewsList = document.getElementById('profileReviewsList');
        reviewsList.innerHTML = ''; 

        if (user.reviewsReceived && user.reviewsReceived.length > 0) {
            const sortedReviews = user.reviewsReceived.sort((a, b) => b.id - a.id);

            sortedReviews.forEach(review => {
                reviewsList.innerHTML += `
                    <div class="review-item">
                        <div style="color: var(--gold); font-weight: bold; margin-bottom: 5px;">Оцінка: ${review.score}/5</div>
                        <div style="color: #e0e0e0; font-style: italic;">"${review.text}"</div>
                    </div>
                `;
            });
        } else {
            reviewsList.innerHTML = '<div style="color: #888; font-style: italic; padding: 10px 0;">Цей гравець ще не отримував відгуків.</div>';
        }

        profileModal.classList.add('active');

    } catch (error) {
        console.error(error);
        alert('Не вдалося завантажити профіль користувача.');
    }
}