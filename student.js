let handRaised = false;
let selectedEmoji = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadHandRaisedState();
    updateHandStatus();
    startTimer();
    startClock();
});

function sendFeedback(emoji, type) {
    selectedEmoji = { type: type, emoji: emoji };

    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.emoji-btn').classList.add('selected');

    storeFeedback(type);

    const confirm = document.getElementById('feedbackConfirm');
    confirm.classList.remove('hidden');
    setTimeout(() => {
        confirm.classList.add('hidden');
        document.getElementById('optionalComment').classList.remove('hidden');
    }, 1500);

    console.log(`Feedback sent: ${emoji} (${type})`);
}

function storeFeedback(type) {
    let feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {
        happy: 0,
        good: 0,
        neutral: 0,
        confused: 0,
        lost: 0,
        bored: 0,
        total: 0
    };

    feedbackData[type]++;
    feedbackData.total++;

    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
}

function toggleRaiseHand() {
    handRaised = !handRaised;
    const btn = document.getElementById('raiseHandBtn');

    if (handRaised) {
        btn.classList.add('active');
        btn.textContent = '✓ Hand gehoben';

        let handCount = parseInt(localStorage.getItem('raiseHandCount')) || 0;
        handCount++;
        localStorage.setItem('raiseHandCount', handCount);
    } else {
        btn.classList.remove('active');
        btn.textContent = '✋ Hand heben';

        let handCount = parseInt(localStorage.getItem('raiseHandCount')) || 0;
        if (handCount > 0) handCount--;
        localStorage.setItem('raiseHandCount', handCount);
    }

    localStorage.setItem('handRaised', handRaised);
    updateHandStatus();
}

function updateHandStatus() {
    const status = document.getElementById('handStatus');
    if (handRaised) {
        status.textContent = 'Der Dozent wurde benachrichtigt (deine Identität bleibt anonym)';
        status.style.color = '#27ae60';
    } else {
        status.textContent = '';
    }
}

function loadHandRaisedState() {
    const saved = localStorage.getItem('handRaised');
    if (saved === 'true') {
        handRaised = true;
        const btn = document.getElementById('raiseHandBtn');
        btn.classList.add('active');
        btn.textContent = '✓ Hand gehoben';
    }
}

function submitComment() {
    const commentBox = document.getElementById('commentBox');
    const comment = commentBox.value.trim();

    if (comment === '') {
        skipComment();
        return;
    }

    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.push({
        text: comment,
        emoji: selectedEmoji ? selectedEmoji.emoji : '💬',
        emojiType: selectedEmoji ? selectedEmoji.type : 'neutral',
        timestamp: new Date().toISOString(),
        timeAgo: 'Gerade eben'
    });
    localStorage.setItem('comments', JSON.stringify(comments));

    commentBox.value = '';
    document.getElementById('optionalComment').classList.add('hidden');

    const confirm = document.getElementById('feedbackConfirm');
    confirm.textContent = '✓ Feedback und Kommentar gesendet!';
    confirm.classList.remove('hidden');
    setTimeout(() => {
        confirm.classList.add('hidden');
        confirm.textContent = '✓ Feedback gesendet!';
    }, 2000);

    console.log('Comment submitted:', comment);
}

function skipComment() {
    document.getElementById('optionalComment').classList.add('hidden');
    document.getElementById('commentBox').value = '';
}

function clearSession() {
    if (confirm('Session-Daten löschen? (Nur für Test-Zwecke)')) {
        localStorage.removeItem('feedbackData');
        localStorage.removeItem('raiseHandCount');
        localStorage.removeItem('handRaised');
        localStorage.removeItem('comments');
        location.reload();
    }
}

function startTimer() {
    function updateTimer() {
        const sessionStartTime = localStorage.getItem('sessionStartTime');
        const timerElement = document.getElementById('sessionTimer');

        if (!sessionStartTime) {
            timerElement.textContent = '00:00';
            return;
        }

        const startTime = parseInt(sessionStartTime);
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);

        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        timerElement.textContent =
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function startClock() {
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        document.getElementById('currentTime').textContent = hours + ':' + minutes;
    }

    updateClock();
    setInterval(updateClock, 1000);
}
