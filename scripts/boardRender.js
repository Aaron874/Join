

/**
 * Render all columns of the board based on `fetchedTasks`.
 * @returns {void}
 */
function renderBoard() {
    Object.entries(COLUMN_IDS).forEach(([status, containerId]) => {
        renderColumn(status, getElement(containerId));
    });
}

/**
 * Render subtasks into the subtasks list element.
 * Expects a global `subtasks` array to be available in context.
 * @returns {void}
 */
function renderSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    list.innerHTML = subtasks
        .map(subtask => `<div>${subtask.title}</div>`)
        .join('');
}


/**
 * Determine whether a task matches the current search filter.
 * Returns true for search terms shorter than three characters.
 * @param {Object} task - Task object to test.
 * @param {string} searchTerm - Lowercased search term.
 * @returns {boolean}
 */
function taskMatchesSearch(task, searchTerm) {
    if (searchTerm.length < 3) return true;
    const assignedTo = Array.isArray(task.assignedTo)
        ? task.assignedTo.map(contact => contact.name).join(' ')
        : task.assignedTo ?? '';
    const subtasks = Array.isArray(task.subtasks)
        ? task.subtasks.map(subtask => subtask.title).join(' ')
        : task.subtasks ?? '';
    return [
        task.title ?? '',
        assignedTo,
        subtasks
    ].some(value =>
        value.toLowerCase().includes(searchTerm)
    );
}

/**
 * Get tasks for a specific board column, applying the active search filter.
 * @param {string} status - Column status key.
 * @returns {Array<Object>}
 */
function getTasksForColumn(status) {
    const searchTerm = currentSearch.toLowerCase();

    return fetchedTasks.filter(task =>
        task.status === status &&
        taskMatchesSearch(task, searchTerm)
    );
}

/**
 * Render tasks for a given status column into the provided container.
 * @param {string} status - Column status key.
 * @param {HTMLElement} container - Container element for task cards.
 * @returns {void}
 */
function renderColumn(status, container) {
    if (!container) {
        console.error('Container missing for status:', status);
        return;
    }
    const content = getTasksForColumn(status)
        .map(getTaskTemplate)
        .join('');
    container.innerHTML =
        content || getEmptyColumnTemplate(status);
}

/**
 * Return HTML used when a column has no tasks.
 * @param {string} status
 * @returns {string}
 */
function getEmptyColumnTemplate(status) {
    return `
        <div class="notask">
            ${EMPTY_COLUMN_TEXTS[status]}
        </div>
    `;
}

/**
 * Return a preview (truncated) version of a text field.
 * @param {string} text
 * @param {number} [maxLength=20]
 * @returns {string}
 */
function getPreviewText(text, maxLength = 20) {
    if (!text || text.length <= maxLength) {
        return text ?? '';
    }
    return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Convert assignedTo value into a comma-separated list of names.
 * @param {string|Array|Object} assignedTo
 * @returns {string}
 */
function getAssignedToText(assignedTo) {
    return normalizeContacts(assignedTo)
        .map(contact => contact.name)
        .join(', ');
}

/**
 * Filter cached tasks by title or assigned contact name.
 * @param {string} searchText - Search string.
 * @returns {Array<Object>}
 */
function filterTasks(searchText) {
    const search = searchText.toLowerCase();
    return fetchedTasks.filter(task => {
        const titleMatch = task.title
            ?.toLowerCase()
            .includes(search);
        const assignedMatch = task.assignedTo
            ?.toLowerCase()
            .includes(search);
        return titleMatch || assignedMatch
    });
}

/**
 * Read the search input value into `currentSearch` and update the board view.
 * @returns {void}
 */
function searchTasks() {
    currentSearch = document.getElementById('search-input')
        .value.trim();
    renderBoard();
}