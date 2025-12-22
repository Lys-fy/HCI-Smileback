function showWeek(weekNumber) {
    document.querySelectorAll('.week-view').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.week-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    let viewId;
    if (weekNumber === 'all') {
        viewId = 'weekViewAll';
    } else {
        viewId = `weekView${weekNumber}`;
    }

    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.classList.add('active');
    }

    event.target.classList.add('active');
}

function initializeAnalyticsData() {
    const weeklyData = {
        week1: {
            title: 'Woche 1 - Einführung in HCI',
            participants: 87,
            totalFeedback: 156,
            handsRaised: 12,
            comments: 8,
            distribution: {
                happy: 45,
                good: 30,
                neutral: 15,
                confused: 7,
                lost: 2,
                bored: 1
            }
        },
        week2: {
            title: 'Woche 2 - User Research Methods',
            participants: 92,
            totalFeedback: 178,
            handsRaised: 15,
            comments: 11,
            distribution: {
                happy: 40,
                good: 35,
                neutral: 12,
                confused: 10,
                lost: 2,
                bored: 1
            }
        }
    };

    return weeklyData;
}

function generateComparisonChart() {
    const trends = [
        { week: 1, positive: 75, neutral: 15, negative: 10 },
        { week: 2, positive: 75, neutral: 12, negative: 13 },
        { week: 3, positive: 68, neutral: 18, negative: 14 },
        { week: 4, positive: 82, neutral: 11, negative: 7 },
        { week: 5, positive: 79, neutral: 13, negative: 8 },
        { week: 6, positive: 85, neutral: 10, negative: 5 }
    ];

    return trends;
}

function generateInsights(weeklyData) {
    const insights = [];

    insights.push('Generell positive Tendenz über das Semester');
    insights.push('Woche 3 zeigt erhöhte Verwirrung - möglicherweise komplexes Thema');
    insights.push('Deutliche Verbesserung ab Woche 4 nach Anpassung der Lehrmethoden');
    insights.push('Durchschnittlich 12-15 "Hand heben" pro Session');

    return insights;
}

function filterByEmoji(emojiType) {
    console.log(`Filtering analytics by emoji: ${emojiType}`);
}

function exportAnalytics() {
    const analyticsData = {
        course: 'Grundlagen der HCI',
        semester: 'WS 2025/26',
        exportDate: new Date().toISOString(),
        weeklyData: initializeAnalyticsData(),
        trends: generateComparisonChart(),
        insights: generateInsights()
    };

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'smileback-analytics.json';
    link.click();

    URL.revokeObjectURL(url);
    alert('Analytics-Daten wurden exportiert!');
}

function printAnalytics() {
    window.print();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Analytics page loaded');
});
