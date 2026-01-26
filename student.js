let handRaised = false;
let selectedEmoji = null;
let pendingFeedback = null;  // NEW: Stores selected but not confirmed emoji
let timerInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadHandRaisedState();
    updateHandStatus();
    startTimer();
    startClock();
    checkSessionStatus();  // Check session status on load
    setInterval(checkSessionStatus, 5000);  // Check every 5 seconds
    setupKeyboardShortcuts();  // Setup keyboard shortcuts
});

// Renamed: now only SELECTS emoji, doesn't send yet
function selectEmoji(emoji, type) {
    pendingFeedback = { emoji, type };

    // Visual feedback - highlight selected emoji
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.remove('selected');
        // If we know the emoji, we can find the button even without a click event
        if (btn.getAttribute('data-emoji') === emoji) {
            btn.classList.add('selected');
        }
    });

    // Show confirm button
    const confirmBtn = document.getElementById('confirmFeedbackBtn');
    confirmBtn.classList.remove('hidden');
    confirmBtn.textContent = `${emoji} senden?`;

    // Scroll into view if on mobile to ensure it's seen
    confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

    console.log(`Emoji selected: ${emoji} (${type})`);
}

// NEW: Opens comment box without requiring emoji selection
function openCommentOnly() {
    selectedEmoji = null; // Clear previous selection
    document.getElementById('optionalComment').classList.remove('hidden');
    document.getElementById('commentBox').focus();
    document.getElementById('optionalComment').scrollIntoView({ behavior: 'smooth' });
}

// NEW: Actually sends the feedback after confirmation
function confirmFeedback() {
    if (!pendingFeedback) return;

    const { emoji, type } = pendingFeedback;
    selectedEmoji = { type, emoji };  // Store for optional comment later

    // Store feedback in localStorage
    storeFeedback(type);

    // Show confirmation
    const confirm = document.getElementById('feedbackConfirm');
    confirm.textContent = `✓ ${emoji} Feedback gesendet!`;
    confirm.classList.remove('hidden');
    setTimeout(() => {
        confirm.classList.add('hidden');
        // Show optional comment section
        document.getElementById('optionalComment').classList.remove('hidden');
    }, 2000);

    // Hide confirm button
    document.getElementById('confirmFeedbackBtn').classList.add('hidden');

    // Clear selection after 2s
    setTimeout(() => {
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        pendingFeedback = null;
    }, 2000);

    console.log(`Feedback confirmed: ${emoji} (${type})`);
}

// NEW: Cancel emoji selection
function cancelFeedback() {
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('confirmFeedbackBtn').classList.add('hidden');
    pendingFeedback = null;
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
        btn.innerHTML = '✓ Hand gehoben<span class="button-hint">Nochmal klicken zum Zurücknehmen</span>';

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

// NEW: Check if session is active and update status banner
function checkSessionStatus() {
    const sessionActive = localStorage.getItem('sessionActive') === 'true';
    const banner = document.getElementById('sessionStatusBanner');
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');

    if (sessionActive) {
        banner.classList.add('active');
        banner.classList.remove('inactive');
        text.textContent = 'Session aktiv - Feedback wird erfasst';
    } else {
        banner.classList.add('inactive');
        banner.classList.remove('active');
        text.textContent = 'Session beendet - Feedback wird nicht erfasst';
    }
}

// NEW: Toggle session details visibility
function toggleSessionDetails() {
    const details = document.getElementById('sessionDetails');
    const toggle = document.querySelector('.info-toggle');

    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        toggle.textContent = '✕';
        toggle.setAttribute('aria-label', 'Session-Details ausblenden');
    } else {
        details.classList.add('hidden');
        toggle.textContent = 'ℹ️';
        toggle.setAttribute('aria-label', 'Session-Details anzeigen');
    }
}

function submitComment() {
    const commentBox = document.getElementById('commentBox');
    const comment = commentBox.value.trim();

    // Clear any existing feedback messages
    const existingFeedback = document.getElementById('commentFeedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Validate minimum length (3 characters)
    if (comment.length < 3) {
        showCommentError('Bitte mindestens 3 Zeichen eingeben');
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
    confirm.textContent = selectedEmoji ? '✓ Feedback und Kommentar gesendet!' : '✓ Kommentar gesendet!';
    confirm.classList.remove('hidden');
    setTimeout(() => {
        confirm.classList.add('hidden');
        confirm.textContent = '✓ Feedback gesendet!';
    }, 2000);

    console.log('Comment submitted:', comment);
}

function showCommentError(message) {
    const commentBox = document.getElementById('commentBox');
    const feedback = document.createElement('div');
    feedback.id = 'commentFeedback';
    feedback.className = 'comment-feedback error';
    feedback.textContent = message;
    commentBox.parentNode.insertBefore(feedback, commentBox.nextSibling);
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

// P12: Keyboard shortcuts for accessibility
function setupKeyboardShortcuts() {
    const emojiMap = {
        '1': { emoji: '😊', type: 'happy' },
        '2': { emoji: '🙂', type: 'good' },
        '3': { emoji: '😐', type: 'neutral' },
        '4': { emoji: '😕', type: 'confused' },
        '5': { emoji: '😓', type: 'lost' },
        '6': { emoji: '😴', type: 'bored' }
    };

    document.addEventListener('keydown', function(e) {
        // Ignore if user is typing in textarea
        if (e.target.tagName === 'TEXTAREA') return;

        // Number keys 1-6: Select emoji
        if (emojiMap[e.key]) {
            const { emoji, type } = emojiMap[e.key];
            selectEmoji(emoji, type);
            e.preventDefault();
        }

        // Enter: Confirm feedback
        if (e.key === 'Enter' && pendingFeedback) {
            confirmFeedback();
            e.preventDefault();
        }

        // Escape: Cancel selection
        if (e.key === 'Escape') {
            cancelFeedback();
            e.preventDefault();
        }

        // H key: Toggle hand raise
        if (e.key === 'h' || e.key === 'H') {
            toggleRaiseHand();
            e.preventDefault();
        }
    });
}
