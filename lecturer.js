let sessionActive = false;
let updateInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    loadSessionState();
});

function toggleSession() {
    sessionActive = !sessionActive;
    const btn = document.querySelector('.btn-primary');
    const status = document.getElementById('sessionStatus');

    if (sessionActive) {
        localStorage.removeItem('feedbackData');
        localStorage.removeItem('raiseHandCount');
        localStorage.removeItem('comments');
        localStorage.setItem('sessionStartTime', Date.now());

        btn.textContent = 'Session beenden';
        btn.classList.add('active');
        status.textContent = '● Aktiv';
        status.classList.remove('inactive');
        status.classList.add('active');

        document.getElementById('qrCodeDisplay').style.display = 'block';

        updateDashboard();
        updateInterval = setInterval(updateDashboard, 3000);
    } else {
        btn.textContent = 'Session starten';
        btn.classList.remove('active');
        status.textContent = '● Inaktiv';
        status.classList.remove('active');
        status.classList.add('inactive');

        document.getElementById('qrCodeDisplay').style.display = 'none';

        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        localStorage.removeItem('sessionStartTime');
    }

    localStorage.setItem('sessionActive', sessionActive);
}

function loadSessionState() {
    const saved = localStorage.getItem('sessionActive');
    const btn = document.querySelector('.btn-primary');
    const status = document.getElementById('sessionStatus');

    if (saved === 'true') {
        sessionActive = true;
        btn.textContent = 'Session beenden';
        btn.classList.add('active');
        status.textContent = '● Aktiv';
        status.classList.remove('inactive');
        status.classList.add('active');
        document.getElementById('qrCodeDisplay').style.display = 'block';

        updateDashboard();
        updateInterval = setInterval(updateDashboard, 3000);
    } else {
        sessionActive = false;
        document.getElementById('qrCodeDisplay').style.display = 'none';
    }
}

function updateDashboard() {
    let feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {
        happy: 0,
        good: 0,
        neutral: 0,
        confused: 0,
        lost: 0,
        bored: 0,
        total: 0
    };

    const total = feedbackData.total || 1;

    const percentages = {
        happy: Math.round((feedbackData.happy / total) * 100),
        good: Math.round((feedbackData.good / total) * 100),
        neutral: Math.round((feedbackData.neutral / total) * 100),
        confused: Math.round((feedbackData.confused / total) * 100),
        lost: Math.round((feedbackData.lost / total) * 100),
        bored: Math.round((feedbackData.bored / total) * 100)
    };

    updateBar('happy', percentages.happy);
    updateBar('good', percentages.good);
    updateBar('neutral', percentages.neutral);
    updateBar('confused', percentages.confused);
    updateBar('lost', percentages.lost);
    updateBar('bored', percentages.bored);

    document.getElementById('totalFeedback').textContent = feedbackData.total;

    const handCount = parseInt(localStorage.getItem('raiseHandCount')) || 0;
    document.getElementById('handCount').textContent = handCount;

    updateComments();
}

function updateBar(type, percentage) {
    const bar = document.getElementById(`${type}-bar`);
    const percentLabel = document.getElementById(`${type}-percent`);

    if (bar && percentLabel) {
        bar.style.width = percentage + '%';
        percentLabel.textContent = percentage + '%';
    }
}

function updateComments() {
    const commentsList = document.getElementById('commentsList');
    const comments = JSON.parse(localStorage.getItem('comments')) || [];

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Noch keine Kommentare</p>';
        return;
    }

    const recentComments = comments.slice(-5).reverse();
    commentsList.innerHTML = recentComments.map(comment => {
        const timeAgo = calculateTimeAgo(comment.timestamp);
        const emoji = comment.emoji || '💬';
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-emoji">${emoji}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <p>"${comment.text}"</p>
            </div>
        `;
    }).join('');
}

function calculateTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins === 1) return '1 Minute ago';
    if (diffMins < 60) return `${diffMins} Minuten ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 Stunde ago';
    if (diffHours < 24) return `${diffHours} Stunden ago`;

    return 'Vor mehr als einem Tag';
}

function resetData() {
    if (confirm('Alle Feedback-Daten zurücksetzen?')) {
        localStorage.removeItem('feedbackData');
        localStorage.removeItem('raiseHandCount');
        localStorage.removeItem('comments');
        updateDashboard();
        alert('Daten wurden zurückgesetzt.');
    }
}

function addDemoData() {
    const demoData = {
        happy: 45,
        good: 30,
        neutral: 15,
        confused: 7,
        lost: 2,
        bored: 1,
        total: 100
    };

    localStorage.setItem('feedbackData', JSON.stringify(demoData));
    localStorage.setItem('raiseHandCount', '3');

    const demoComments = [
        {
            text: "Könnten Sie das nochmal langsamer erklären?",
            emoji: "😕",
            emojiType: "confused",
            timestamp: new Date(Date.now() - 45 * 60000).toISOString()
        },
        {
            text: "Sehr interessantes Thema! Gibt es dazu weiterführende Literatur?",
            emoji: "😊",
            emojiType: "happy",
            timestamp: new Date(Date.now() - 60 * 60000).toISOString()
        }
    ];

    localStorage.setItem('comments', JSON.stringify(demoComments));
    updateDashboard();
    alert('Demo-Daten wurden hinzugefügt!');
}

function exportSessionData() {
    const feedbackData = localStorage.getItem('feedbackData');
    const comments = localStorage.getItem('comments');
    const handCount = localStorage.getItem('raiseHandCount');

    const exportData = {
        session: '#2025-W07',
        course: 'Grundlagen der HCI',
        date: new Date().toISOString(),
        feedback: JSON.parse(feedbackData || '{}'),
        raiseHandCount: parseInt(handCount || '0'),
        comments: JSON.parse(comments || '[]')
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'smileback-session-data.json';
    link.click();

    URL.revokeObjectURL(url);
}
