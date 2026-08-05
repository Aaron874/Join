document.addEventListener('DOMContentLoaded', initSummary);



const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

let summaryTasks = [];

document.addEventListener('DOMContentLoaded', initSummary);

async function initSummary() {
    summaryTasks = await fetchTasks();

    const userName =
        await window.getCurrentRegisteredUserName();

    renderSummary(userName);
}

async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const data = await response.json();
        summaryTasks = Object.entries(data ?? {}).map(([id, task]) => ({
            ...task,
            id,
        }));
        return summaryTasks;
    } catch (error) {
        console.error('Fehler beim Abrufen:', error);
        summaryTasks = [];
        return [];
    }
}

function getTaskCountByStatus(status) {
    return summaryTasks.filter(task => task.status === status).length;
}

function getTaskCountByPriority(priority) {
    return summaryTasks.filter(task => task.priority === priority).length;
}

function getTaskCount() {
    return summaryTasks.length;
}

function renderSummary(userName) {
    const container = document.getElementById('summary-content');

    container.innerHTML = getSummaryTemplate({
        todo: getTaskCountByStatus('todo'),
        done: getTaskCountByStatus('done'),
        urgent: getTaskCountByPriority('urgent'),
        total: getTaskCount(),
        inProgress: getTaskCountByStatus('inProgress'),
        awaitFeedback: getTaskCountByStatus('awaitFeedback'),
        deadline: getUpcomingDeadline(),
        greeting: getGreeting(),
        userName
    });
}

function getUpcomingDeadline() {
    const tasksWithDate = summaryTasks.filter(task => task.date);
    if (!tasksWithDate.length) {
        return 'No deadline';
    }
    const sortedTasks = [...tasksWithDate].sort((a, b) => {
        return parseTaskDate(a.date) - parseTaskDate(b.date);
    });
    return formatDeadline(sortedTasks[0].date);
}

function parseTaskDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
}

function formatDeadline(dateString) {
    return parseTaskDate(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
        return 'Good morning,';
    }
    if (currentHour < 18) {
        return 'Good afternoon,';
    }
    return 'Good evening,';
}