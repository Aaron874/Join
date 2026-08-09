/**
 * Summary module
 * Responsible for fetching tasks and rendering a small summary view
 * including counts by status/priority and next upcoming deadline.
 */
document.addEventListener('DOMContentLoaded', initSummary);

const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

let summaryTasks = [];

/**
 * Initialize the summary view: fetch tasks and render summary.
 * @returns {Promise<void>}
 */
async function initSummary() {
    summaryTasks = await fetchTasks();

    const userName =
        await window.getCurrentRegisteredUserName();

    renderSummary(userName);
}

/**
 * Fetch tasks from Firebase and store them in `summaryTasks`.
 * @param {string} [path='tasks'] - Firebase path to fetch
 * @returns {Promise<Array<Object>>} Array of tasks
 */
async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        summaryTasks = normalizeFetchedTasks(data);
        return summaryTasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        summaryTasks = [];
        return [];
    }
}

/**
 * Normalize fetched task data from Firebase into a flat array of task objects.
 * @param {Object<string, any> | null | undefined} data - Raw task data from Firebase.
 * @returns {Array<Object>} Normalized tasks with a stable `id` and, where applicable, a `userId`.
 */
function normalizeFetchedTasks(data) {
    return Object.entries(data ?? {}).flatMap(([firstLevelId, value]) => {
        if (isTaskObject(value)) {
            return [{
                ...value,
                id: firstLevelId,
            }];
        }

        return Object.entries(value ?? {})
            .filter(([, task]) => isTaskObject(task))
            .map(([taskId, task]) => ({
                ...task,
                id: taskId,
                userId: firstLevelId,
            }));
    });
}

/**
 * Check whether a value represents a task-like object.
 * @param {any} value - Value to validate.
 * @returns {boolean} True if the value has the expected task fields.
 */
function isTaskObject(value) {
    return (
        value &&
        typeof value === 'object' &&
        typeof value.title === 'string' &&
        typeof value.status === 'string'
    );
}

/**
 * Count tasks filtered by status.
 * @param {string} status
 * @returns {number}
 */
function getTaskCountByStatus(status) {
    return summaryTasks.filter(task => task.status === status).length;
}

/**
 * Count tasks filtered by priority.
 * @param {string} priority
 * @returns {number}
 */
function getTaskCountByPriority(priority) {
    return summaryTasks.filter(task => task.priority === priority).length;
}

/**
 * Return total number of tasks in cache.
 * @returns {number}
 */
function getTaskCount() {
    return summaryTasks.length;
}

/**
 * Render the summary HTML into the summary container.
 * @param {string} userName
 * @returns {void}
 */
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

/**
 * Return the nearest upcoming task deadline formatted for display.
 * If no dated tasks exist returns 'No deadline'.
 * @returns {string}
 */
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

/**
 * Parse a date in 'DD/MM/YYYY' format into a Date object.
 * @param {string} dateString - Date string in 'DD/MM/YYYY'
 * @returns {Date}
 */
function parseTaskDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
}

/**
 * Format a 'DD/MM/YYYY' date string into a human-readable form.
 * @param {string} dateString
 * @returns {string}
 */
function formatDeadline(dateString) {
    return parseTaskDate(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Return a greeting string based on the current hour.
 * @returns {string}
 */
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