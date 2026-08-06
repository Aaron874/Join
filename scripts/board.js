
/**
 * Board module
 *
 * Responsible for loading, rendering and managing tasks on the board
 * (drag & drop, create, update, delete). Interacts with Firebase
 * Realtime Database and provides utility helpers for task UI.
 */
window.addEventListener('DOMContentLoaded', initBoard);

const BASE_URL ='https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/'

const COLUMN_IDS = {
    todo: 'todo-container',
    inProgress: 'progress-container',
    awaitFeedback: 'feedback-container',
    done: 'done-container',
};

const STATUS_ORDER = [
    'todo',
    'inProgress',
    'awaitFeedback',
    'done'
];

const STATUS_LABELS = {
    todo: 'To Do',
    inProgress: 'In Progress',
    awaitFeedback: 'Await Feedback',
    done: 'Done'
};

const EMPTY_COLUMN_TEXTS = {
    todo: 'No tasks To do',
    inProgress: 'No tasks in progress',
    awaitFeedback: 'No tasks await feedback',
    done: 'No tasks done',
};

let fetchedTasks = [];
let fetchedContacts = [];
let draggedTaskId;
let editingTaskId;
let currentTaskId;
let currentSearch = '';

/**
 * Initialize the board.
 * Loads board contacts, fetches tasks and initializes drag-and-drop.
 * @returns {Promise<void>}
 */
async function initBoard() {
    await loadBoardContacts();
    await reloadBoard();
    initDragAndDrop();
}

/**
 * Reloads the board data by fetching latest tasks and re-rendering.
 * @returns {Promise<void>}
 */
async function reloadBoard() {
    await fetchTasks();
    renderBoard();

}

/**
 * Fetch tasks from Firebase Realtime Database and normalize the result.
 * @param {string} [path='tasks'] - Firebase path to fetch (e.g. 'tasks' or 'tasks/{userId}').
 * @returns {Promise<Array>} Array of normalized task objects.
 */
async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        fetchedTasks = normalizeFetchedTasks(data);
        return fetchedTasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        fetchedTasks = [];
        return [];
    }
}

/**
 * Build request options for JSON-based fetch calls.
 * @param {string} method - HTTP method for the request.
 * @param {Object} data - Payload to serialize as JSON.
 * @returns {{method:string, headers:Object, body:string}}
 */
function getJsonRequestOptions(method, data) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
}

/**
 * Parse a Firebase REST response and return the JSON payload.
 * @param {Response} response - Fetch response object.
 * @param {string} errorMessage - Error message prefix for failures.
 * @returns {Promise<unknown|null>} Parsed response body, or null for empty responses.
 * @throws {Error} If the response is not ok.
 */
async function parseFirebaseResponse(response, errorMessage) {
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(
            `${errorMessage}: ${response.status} – ${responseText}`
        );
    }
    return responseText
        ? JSON.parse(responseText)
        : null;
}

/**
 * Normalize tasks stored under a user-specific Firebase node.
 * @param {string} userId - Firebase user id that owns the task list.
 * @param {Object} userTasks - Object containing tasks keyed by task id.
 * @returns {Array<Object>} Array of normalized task objects.
 */
function normalizeUserTasks(userId, userTasks) {
    return Object.entries(userTasks ?? {})
        .filter(([, task]) => isTaskObject(task))
        .map(([taskId, task]) => ({
            ...task,
            id: taskId,
            userId,
        }));
}

/**
 * Convert raw Firebase result data into a flat array of task objects.
 * Supports both top-level task entries and nested user task maps.
 * @param {Object} data - Raw data returned by Firebase.
 * @returns {Array<Object>} Normalized list of task objects.
 */
function normalizeFetchedTasks(data) {
    return Object.entries(data ?? {}).flatMap(
        ([firstLevelId, value]) => {
            if (isTaskObject(value)) {
                return [{
                    ...value,
                    id: firstLevelId,
                }];
            }
            return normalizeUserTasks(firstLevelId, value);
        }
    );
}

/**
 * Heuristic to determine whether a value looks like a task object.
 * @param {unknown} value
 * @returns {boolean}
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

// ...existing code...
/**
 * Determine whether a task matches the current search filter.
 * Returns true for search terms shorter than three characters.
 * @param {Object} task - Task object to test.
 * @param {string} searchTerm - Lowercased search term.
 * @returns {boolean}
 */
function taskMatchesSearch(task, searchTerm) {
    if (searchTerm.length < 3) return true;

    const searchableValues = [
        task.title,
        task.assignedTo,
    ];

    return searchableValues.some(value =>
        value?.toLowerCase().includes(searchTerm)
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
 * Initialize drag and drop listeners for task columns.
 * @returns {void}
 */
function initDragAndDrop() {
    document.querySelectorAll('.task-queue').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

/**
 * Handler for dragstart on a task card. Stores dragged task id.
 * @param {DragEvent} event
 */
function handleDragStart(event) {
    const card = event.currentTarget;
    draggedTaskId = card.dataset.taskId;
    card.classList.add('dragging');
}

/**
 * Handler for dragend on a task card. Clears drag state.
 * @param {DragEvent} event
 */
function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    event.currentTarget.classList.remove('highlight');
    draggedTaskId = null;
}

/**
 * Handler for dragover to allow drop.
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('highlight');

}

function handleDragLeave(event) {
    const column = event.currentTarget;
    if(column.contains(event.relatedTarget)) return;
    column.classList.remove('highlight');
}

/**
 * Handler for drop event on a column. Updates task status and reloads board.
 * @param {DragEvent} event
 * @returns {Promise<void>}
 */
async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('highlight');
    const task = getTaskById(draggedTaskId);
    const newStatus = event.currentTarget.dataset.status;
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Drop failed:', error);
    }
}

/**
 * Update only the `status` field of a task in Firebase.
 * @param {Object} task - Task object containing `id` and optional `userId`.
 * @param {string} status - New status value.
 * @returns {Promise<void>}
 */
async function updateTaskStatus(task, status) {
    const taskPath = task.userId
    ? `tasks/${task.userId}/${task.id}`
    : `tasks/${task.id}`;
    const response = await fetch(`${BASE_URL}${taskPath}.json`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status,
            }),
        }
    );
    validateResponse(response, 'Status update failed')
}

/**
 * Open task details dialog for a given task id.
 * @param {string} taskId
 * @returns {void}
 */
function openTaskDetails(taskId) {
    currentTaskId = taskId;
    const task = getTaskById(taskId);
    const dialog = getElement('task-dialog');
    if (!task || !dialog) return;
    dialog.innerHTML = getTaskDialogTemplate(task);
    dialog.showModal();
}

/**
 * Close the currently open task dialog.
 * @returns {void}
 */
function closeTaskDialog() {
    closeDialog('task-dialog');
}

/**
 * Delete a task by id (removes from Firebase and reloads board).
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) {
        console.error('Task to delete not found:', taskId);
        return;
    }
    try {
        await deleteTaskFromFirebase(task);
        closeTaskDialog();
        await reloadBoard();
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

/**
 * Create a new task in Firebase.
 * @param {Object} task - Task payload to POST
 * @returns {Promise<Object>} Parsed JSON response from Firebase
 */
async function createTaskInFirebase(task) {
    const response = await fetch(`${BASE_URL}tasks.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    validateResponse(response, 'Failed to create task');
    return response.json();
}

/**
 * Delete a task in Firebase using its object (id and optional userId).
 * @param {Object} task
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirebase(task) {
    const taskPath = task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
    const response = await fetch(
        `${BASE_URL}${taskPath}.json`,
        {
            method: 'DELETE',
        }
    );
    validateResponse(response, 'Failed to delete task');
}

/**
 * Open the edit form for a given task id and populate with values.
 * @param {string} taskId
 * @returns {void}
 */
function openEditTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    editingTaskId = taskId;
    closeTaskDialog();
    fillTaskForm(task);
    setTaskFormMode('edit');
    openDialog('add-task-dialog');
}

/**
 * Open the create-task dialog and reset form state.
 * @param {string} [status='todo'] - default status for the new task
 */
function openCreateTaskDialog(status = 'todo') {
    editingTaskId = null;
    clearTaskform();
    setTaskFormMode('create');
    setFormStatus(status);
    openDialog('add-task-dialog');
}

/**
 * Populate the add/edit task form with values from a task object.
 * @param {Object} task
 */
function fillTaskForm(task) {
    setInputValue('task-title', task.title);
    setInputValue('task-description', task.description);
    setTextContent('selected_category_text', task.category);
    setTaskDate(task.date);
    selectPriority(task.priority);
    setAssignedContacts(task.assignedTo);
    setTaskSubtasks(task.subtasks);
}

/**
 * Set date fields in the task form for display and input values.
 * Accepts either 'YYYY-MM-DD' or 'DD/MM/YYYY'.
 * @param {string} date
 */
function setTaskDate(date) {
    const displayInput = getElement('dateDisplay');
    const dateInput = getElement('dateInput');
    if (!displayInput || !dateInput) return;
    displayInput.value = formatDateForDisplay(date);
    dateInput.value = formatDateForInput(date);
}

/**
 * Convert a date value to display format 'DD/MM/YYYY'. If already in that
 * format, returns unchanged.
 * @param {string} date
 * @returns {string}
 */
function formatDateForDisplay(date) {
    if (!date) return '';
    if (date.includes('/')) {
        return date;
    }
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Convert a date value to input format 'YYYY-MM-DD'. If already in that
 * format, returns unchanged.
 * @param {string} date
 * @returns {string}
 */
function formatDateForInput(date) {
    if (!date) return '';
    if (date.includes('-')) {
        return date;
    }
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
}

/**
 * Select a priority element in the UI and trigger the color change.
 * @param {string} priorityValue
 */
function selectPriority(priorityValue) {
    const priorityElement = getElement(`priority-${priorityValue}`);
    if (!priorityElement) return;
    window.colorChangePriority(priorityElement);
}

/**
 * Ensure board contacts are loaded and open the contacts dropdown.
 * @returns {Promise<void>}
 */
async function openBoardContactsDropdown() {
    if (!window.contactsList?.length) {
        await loadBoardContacts();
    }
    dropdownContactsDown();
}


/**
 * Set assigned contacts in the add/edit task form UI.
 * Accepts array or comma-separated string values.
 * @param {string|Array|Object} assignedTo
 */
function setAssignedContacts(assignedTo) {
    selectedContacts = normalizeContacts(assignedTo);
    showSelectedContacts();
}

/**
 * Normalize assignedTo into an array of contact objects.
 * @param {string|Array|Object} assignedTo
 * @returns {Array<Object>}
 */
function normalizeContacts(assignedTo) {
    if (!assignedTo) return [];
    const contacts = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.split(',');
    return contacts
        .map(getContactObject)
        .filter(Boolean);
}

/**
 * Convert a contact item (string or object) into a canonical contact object.
 * @param {string|Object} contact
 * @returns {Object|null}
 */
function getContactObject(contact) {
    return isContactObject(contact)
        ? normalizeContactObject(contact)
        : createContactObject(contact);
}

/**
 * Check whether the provided value is a contact object with a name.
 * @param {unknown} contact
 * @returns {boolean}
 */
function isContactObject(contact) {
    return typeof contact === 'object' && contact?.name;
}

/**
 * Return the Firebase storage path for a task.
 * @param {Object} task - Task object containing `id` and optional `userId`.
 * @returns {string}
 */
function getTaskPath(task) {
    return task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
}

/**
 * Normalize a contact object by enriching with shortName and color from
 * the board contacts if available.
 * @param {Object} contact
 * @returns {Object}
 */
function normalizeContactObject(contact) {
    const contactData = findContactByName(contact.name);
    return {
        name: contact.name,
        shortName: getContactShortName(contact, contactData),
        color: getContactColor(contact, contactData)
    };
}

/**
 * Create a contact object from a string name, attempting to enrich from
 * existing board contacts.
 * @param {string} contact
 * @returns {Object|null}
 */
function createContactObject(contact) {
    const contactName = String(contact).trim();
    if (!contactName) return null;
    const contactData = findContactByName(contactName);
    return {
        name: contactData?.name ?? contactName,
        shortName: getContactShortName(contactData, contactData),
        color: getContactColor(contactData, contactData)
    };
}

/**
 * Determine a short display name (initials) for a contact.
 * @param {Object} contact
 * @param {Object} contactData
 * @returns {string}
 */
function getContactShortName(contact, contactData) {
    return contact?.shortName
        ?? contact?.shortname
        ?? contactData?.shortName
        ?? contactData?.shortname
        ?? contactListInitials(contactData?.name ?? contact?.name ?? '');
}

/**
 * Get display color for a contact, falling back to a default.
 * @param {Object} contact
 * @param {Object} contactData
 * @returns {string}
 */
function getContactColor(contact, contactData) {
    return contact?.color
        ?? contactData?.color
        ?? '#2A3647';
}

/**
 * Find a contact in the `boardContacts` array by name (case-insensitive).
 * @param {string} contactName
 * @returns {Object|undefined}
 */
function findContactByName(contactName) {
    const normalizedName = contactName.trim().toLowerCase();
    return boardContacts.find(
        contact =>
            contact.name.trim().toLowerCase() === normalizedName
    );
}

/**
 * Build initials from a contact name (first two words).
 * @param {string} contactName
 * @returns {string}
 */
function contactListInitials(contactName) {
    return contactName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('');
}

/**
 * Return initials for a contact, preferring provided contactData.
 * @param {string} contactName
 * @param {Object} contactData
 * @returns {string}
 */
function getInitials(contactName, contactData) {
    return contactData
        ? contactListInitials(contactData.name)
        : contactName.slice(0, 2).toUpperCase();
}

/**
 * Set the task form mode to 'create' or 'edit' and update labels.
 * @param {string} mode
 */
function setTaskFormMode(mode) {
    const isEditMode = mode === 'edit';
    setTextContent(
        '.add_task-h1',
        isEditMode ? 'Edit Task' : 'Add Task',
        true
    );
    setTextContent(
        '#save-task-button .font-size-buttons',
        isEditMode ? 'Save' : 'Create Task',
        true
    );
}

/**
 * Set subtasks into the global add-task widget helper.
 * @param {Array|String} taskSubtasks
 */
function setTaskSubtasks(taskSubtasks) {
    window.setAddTaskSubtasks(taskSubtasks);
}

/**
 * Submit handler for saving a task (create or update).
 * Validates form, persists task and finishes the UI flow.
 * @param {Event} event
 * @returns {Promise<void>}
 */
async function saveTask(event) { 
    event.preventDefault();
    const defaultStatus =
        document.getElementById('add-task-dialog').dataset.status || 'todo';
    const task = getTaskFormData(defaultStatus);
    if (!isTaskValid(task)) return;
    try {
        await persistTask(task);
        await finishSavingTask();
    } catch (error) {
        console.error('Failed to save task:', error);
    }
}

/**
 * Persist a task either by creating a new one or updating an existing one.
 * @param {Object} taskData
 * @returns {Promise<Object|null|void>}
 */
async function persistTask(taskData) {
    if(!editingTaskId){
        return window.addTaskToFirebase(taskData)
    }
    const existingTask = getTaskById(editingTaskId);
    if (!existingTask){
        throw new Error('Task to edit not found.');
    }
    return updateTaskInFirebase(existingTask, taskData)
}

/**
 * Read form values and construct a task payload object.
 * @param {string} defaultStatus
 * @returns {Object} task payload
 */
function getTaskFormData(defaultStatus) {
    const existingTask = getTaskById(editingTaskId);
    const addTaskState = window.getAddTaskState();
    return {
        title: getInputValue('task-title'),
        description: getInputValue('task-description'),
        date: getInputValue('dateDisplay'),
        priority: addTaskState.priority,
        assignedTo: addTaskState.selectedContacts
            .map(contact => contact.name)
            .join(', '),
        category: getTextContent('selected_category_text'),
        subtasks: [...addTaskState.subtasks],
        status: existingTask?.status ?? defaultStatus,
    };
}

/**
 * Build HTML for task detail subtasks view.
 * @param {Array|string} taskSubtasks
 * @returns {string} HTML fragment
 */
function getTaskDetailSubtasksTemplate(taskSubtasks) {
    const subtasks = normalizeTaskSubtasks(taskSubtasks);
    if (!subtasks.length) {
        return '<p>No subtasks</p>';
    }
    return subtasks
        .map((subtask, index) => `
        <label class="task-detail-subtask">
            <span>${subtask.title}</span>
            <input
                type="checkbox"
                ${subtask.completed ? 'checked' : ''}
                onchange="toggleTaskSubtask(${index})"
            >
        </label>
    `)
        .join('');
}

/**
 * Normalize subtasks field into an array structure.
 * Accepts array or newline/comma-separated string inputs.
 * @param {Array|string|undefined} taskSubtasks
 * @returns {Array}
 */
function normalizeTaskSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        return taskSubtasks;
    }
    if (typeof taskSubtasks === 'string' && taskSubtasks.trim()) {
        return [{
            title: taskSubtasks.trim(),
            completed: false
        }];
    }
    return [];
}

/**
 * Toggle completion state of a subtask for the currently opened task.
 * Updates Firebase and refreshes the UI.
 * @param {number} index - Index of the subtask in the task's subtasks array
 * @returns {Promise<void>}
 */
async function toggleTaskSubtask(index) {
    const task = fetchedTasks.find(task => task.id === currentTaskId);
    if (!task || !Array.isArray(task.subtasks) || !task.subtasks[index]) {
        console.error('Task or subtask not found');
        return;
    }
    task.subtasks[index].completed = !task.subtasks[index].completed;
    try {
        await updateTaskSubtasksInFirebase(task, task.subtasks);
        await reloadBoard();
        openTaskDetails(task.id);
    } catch (error) {
        task.subtasks[index].completed = !task.subtasks[index].completed;
        console.error('Failed to update subtask:', error);
    }
}

/**
 * Persist updated subtasks array for a task to Firebase.
 * @param {Object} task
 * @param {Array} subtasks
 * @returns {Promise<void>}
 */
async function updateTaskSubtasksInFirebase(task, subtasks) {
    const response = await fetch(
        `${BASE_URL}${getTaskPath(task)}.json`,
        getJsonRequestOptions('PATCH', { subtasks })
    );

    await parseFirebaseResponse(
        response,
        'Subtasks konnten nicht aktualisiert werden'
    );
}

/**
 * Count completed subtasks in an array.
 * @param {Array} subtasks
 * @returns {number}
 */
function getCompletedSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) {
        return 0;
    }
    return subtasks.filter(subtask => subtask.completed).length;
}

/**
 * Compute subtask completion progress as a percentage.
 * @param {Array} subtasks
 * @returns {number} percentage (0-100)
 */
function getSubtaskProgress(subtasks) {
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
        return 0;
    }
    return Math.round(
        (getCompletedSubtasks(subtasks) / subtasks.length) * 100
    );
}

/**
 * Check whether a task has subtasks.
 * @param {Object} task
 * @returns {boolean}
 */
function hasSubtasks(task) {
    return Array.isArray(task.subtasks) && task.subtasks.length > 0;
}

/**
 * Return comma-separated names of currently selected contacts from the global helper.
 * @returns {string}
 */
function getSelectedContactNames() {
    const contacts = window.getSelectedContacts?.() ?? [];
    return contacts
        .map(contact => contact.name)
        .join(', ');
}

/**
 * Validate that required fields for a task are present.
 * Triggers `formRequired()` UI helper and returns boolean validity.
 * @param {Object} task
 * @returns {boolean}
 */
function isTaskValid(task) {
    formRequired();

    return Boolean(
        task.title &&
        task.date &&
        task.priority &&
        isValidCategory(task.category)
    );
}

/**
 * Validate the selected task category is not the placeholder value.
 * @param {string} category
 * @returns {boolean}
 */
function isValidCategory(category) {
    return Boolean(
        category &&
        category !== 'Select task category' &&
        category !== 'Select Task Category'
    );
}

/**
 * Replace an existing task in Firebase (PUT) with provided task data.
 * @param {Object} existingTask
 * @param {Object} taskData
 * @returns {Promise<Object|null>} Parsed response or null
 */
async function updateTaskInFirebase(existingTask, taskData) {
    const response = await fetch(
        `${BASE_URL}${getTaskPath(existingTask)}.json`,
        getJsonRequestOptions('PUT', taskData)
    );

    return parseFirebaseResponse(
        response,
        'Task update failed'
    );
}

/**
 * Finalize UI and state after saving a task: reset form state and reload board.
 * @returns {Promise<void>}
 */
async function finishSavingTask() {
    resetTaskFormState();
    clearTaskform();
    closeDialog('add-task-dialog');
    setTaskFormMode('create');
    await reloadBoard();
}

/**
 * Reset local form related state variables.
 * @returns {void}
 */
function resetTaskFormState() {
    editingTaskId = null;
    priority = [];
    selectedContacts = [];
}

/**
 * Set the status dataset attribute on the add-task dialog.
 * @param {string} status
 */
function setFormStatus(status) {
    const dialog = getElement('add-task-dialog');
    if (!dialog) return;
    dialog.dataset.status = status;
}

/**
 * Find a task in the cached `fetchedTasks` by id.
 * @param {string} taskId
 * @returns {Object|undefined}
 */
function getTaskById(taskId) {
    return fetchedTasks.find(task => task.id === taskId);
}

/**
 * Get trimmed value from an input element by id.
 * @param {string} id
 * @returns {string}
 */
function getInputValue(id) {
    return getElement(id)?.value.trim() ?? '';
}

/**
 * Set value on an input element by id.
 * @param {string} id
 * @param {string} value
 */
function setInputValue(id, value) {
    const element = getElement(id);
    if (!element) return;
    element.value = value ?? '';
}

/**
 * Get trimmed textContent of an element by id.
 * @param {string} id
 * @returns {string}
 */
function getTextContent(id) {
    return getElement(id)?.textContent.trim() ?? '';
}

/**
 * Set textContent on an element. Optionally use querySelector instead of id lookup.
 * @param {string} selector - id or selector
 * @param {string} value
 * @param {boolean} [useSelector=false]
 */
function setTextContent(selector, value, useSelector = false) {
    const element = useSelector
        ? document.querySelector(selector)
        : getElement(selector);
    if (!element) return;
    element.textContent = value ?? '';
}

/**
 * Shorthand for document.getElementById.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Open a native dialog element by id.
 * @param {string} id
 */
function openDialog(id) {
    getElement(id)?.showModal();
}

/**
 * Close a native dialog element by id.
 * @param {string} id
 */
function closeDialog(id) {
    getElement(id)?.close();
}

/**
 * Validate a fetch Response and throw an Error with provided message if not ok.
 * @param {Response} response
 * @param {string} message
 */
function validateResponse(response, message) {
    if (!response.ok) {
        throw new Error(`${message}: ${response.status}`);
    }
}

/**
 * Filter cached tasks by title or assigned contact name.
 * @param {string} searchText - Search string.
 * @returns {Array<Object>}
 */
function filterTasks(searchText){
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
function searchTasks(){
    currentSearch = document.getElementById('search-input')
    .value.trim();
    renderBoard();
}

/**
 * Show a short confirmation dialog after a task has been created.
 * @returns {void}
 */
function taskSuccessfullyCreatedDialog() {
    const successDialog = document.getElementById('task_dialog_success_id');
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
    }, 2000);
}

/**
 * Open a confirmation dialog to delete a task.
 * @param {string} taskId
 * @param {string} taskTitle
 */
function deleteTaskDialog(taskId, taskTitle) {
    const deleteDialog = document.getElementById('task_dialog_delete_id');
    const taskName = deleteDialog.querySelector('#task_name_id');
    const buttons = deleteDialog.querySelectorAll('.delete_btn_container button');
    const deleteButton = buttons[0];
    const cancelButton = buttons[1];
    taskName.textContent = taskTitle;
    eventListenerDeleteTaskDialog(taskId, deleteButton, cancelButton, deleteDialog);
    deleteDialog.showModal();
}

/**
 * Attach event listeners to delete dialog buttons.
 * @param {string} taskId
 * @param {HTMLElement} deleteButton
 * @param {HTMLElement} cancelButton
 * @param {HTMLElement} deleteDialog
 */
function eventListenerDeleteTaskDialog(taskId, deleteButton, cancelButton, deleteDialog) {
    deleteButton.onclick = async () => {
        await deleteTask(taskId);
        deleteDialog.close();
    };
    cancelButton.onclick = () => {
        deleteDialog.close();
    };
}

/**
 * Get the previous status key in the workflow order, or null if none.
 * @param {string} currentStatus
 * @returns {string|null}
 */
function getPreviousStatus(currentStatus){
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if(currentIndex <= 0){
        return null;
    }
    return STATUS_ORDER[currentIndex - 1];
}

/**
 * Get the next status key in the workflow order, or null if none.
 * @param {string} currentStatus
 * @returns {string|null}
 */
function getNextStatus(currentStatus){
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if(
        currentIndex === -1 ||
        currentIndex >= STATUS_ORDER.length - 1
    ){
        return null;
    }
    return STATUS_ORDER[currentIndex + 1];
}

/**
 * Handle click on a task card. If the click happened on the move menu wrapper
 * ignore it; otherwise open task details.
 * @param {MouseEvent} event
 * @param {string} taskId
 */
function handleTaskCardClick(event, taskId){
    if(event.target.closest('.move-task-wrapper')){
        return;
    }
    openTaskDetails(taskId);
}

/**
 * Toggle the move-task menu visibility for a specific task card.
 * @param {Event} event
 * @param {string} taskId
 */
function toggleMoveTaskMenu(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById(`move-task-menu-${taskId}`);
    if (!menu) {
        console.error('Move menu not found for task:', taskId);
        return;
    }
    menu.classList.toggle('move-task-menu-open');
}

/**
 * Move a task to a new status programmatically (used by move menu).
 * @param {Event} event
 * @param {string} taskId
 * @param {string} newStatus
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(event, taskId, newStatus) {
    event.preventDefault();
    event.stopPropagation();
    const task = getTaskById(taskId);
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Failed to move task', error);
    }
}