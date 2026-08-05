
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

async function initBoard() {
    await loadBoardContacts();
    await reloadBoard();
    initDragAndDrop();
}

async function reloadBoard() {
    await fetchTasks();
    renderBoard();

}

async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const data = await response.json();
        fetchedTasks = normalizeFetchedTasks(data);
        return fetchedTasks;
    } catch (error) {
        console.error('Fehler beim Abrufen:', error);
        fetchedTasks = [];
        return [];
    }
}

function normalizeFetchedTasks(data) {
    const tasks = [];
    Object.entries(data ?? {}).forEach(([firstLevelId, value]) => {
        if (isTaskObject(value)) {
            tasks.push({
                ...value,
                id: firstLevelId,
            });
            return;
        }

        Object.entries(value ?? {}).forEach(([taskId, task]) => {
            if (!isTaskObject(task)) return;
            tasks.push({
                ...task,
                id: taskId,
                userId: firstLevelId,
            });
        });
    });
    return tasks;
}

function isTaskObject(value) {
    return (
        value &&
        typeof value === 'object' &&
        typeof value.title === 'string' &&
        typeof value.status === 'string'
    );
}

function renderBoard() {
    Object.entries(COLUMN_IDS).forEach(([status, containerId]) => {
        renderColumn(status, getElement(containerId));
    });
}

function renderSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    list.innerHTML = subtasks
        .map(subtask => `<div>${subtask.title}</div>`)
        .join('');
}

function renderColumn(status, container) {
    if (!container) {
        console.error('Container fehlt für Status:', status);
        return;
    }
    const columnTasks = fetchedTasks.filter(task => task.status === status);
    const content = columnTasks
        .map(getTaskTemplate)
        .join('');
    container.innerHTML =
        content || getEmptyColumnTemplate(status);
}

function getEmptyColumnTemplate(status) {
    return `
        <div class="notask">
            ${EMPTY_COLUMN_TEXTS[status]}
        </div>
    `;
}

function getPreviewText(text, maxLength = 20) {
    if (!text || text.length <= maxLength) {
        return text ?? '';
    }
    return `${text.slice(0, maxLength).trim()}...`;
}

function getAssignedToText(assignedTo) {
    return normalizeContacts(assignedTo)
        .map(contact => contact.name)
        .join(', ');
}

function initDragAndDrop() {
    document.querySelectorAll('.task-queue').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(event) {
    const card = event.currentTarget;
    draggedTaskId = card.dataset.taskId;
    card.classList.add('dragging');
}

function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    draggedTaskId = null;
}

function handleDragOver(event) {
    event.preventDefault();
}

async function handleDrop(event) {
    event.preventDefault();
    const task = getTaskById(draggedTaskId);
    const newStatus = event.currentTarget.dataset.status;
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Drop fehlgeschlagen:', error);
    }
}

async function updateTaskStatus(task, status) {
    const taskPath = task.userId
    ? `tasks/${task.userId}/${task.id}`
    : `tasks/${task.id}`;
    const response = await fetch(
        `${BASE_URL}${taskPath}.json`,
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
    validateResponse(response, 'Status-Update fehlgeschlagen')
}

function openTaskDetails(taskId) {
    currentTaskId = taskId;
    const task = getTaskById(taskId);
    const dialog = getElement('task-dialog');
    if (!task || !dialog) return;
    dialog.innerHTML = getTaskDialogTemplate(task);
    dialog.showModal();
}

function closeTaskDialog() {
    closeDialog('task-dialog');
}

async function deleteTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) {
        console.error('Der zu löschende Task wurde nicht gefunden:', taskId);
        return;
    }
    try {
        await deleteTaskFromFirebase(task);
        closeTaskDialog();
        await reloadBoard();
    } catch (error) {
        console.error('Task konnte nicht gelöscht werden:', error);
    }
}

async function createTaskInFirebase(task) {
    const response = await fetch(`${BASE_URL}tasks.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    validateResponse(response, 'Task konnte nicht erstellt werden');
    return response.json();
}

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
    validateResponse(response, 'Task konnte nicht gelöscht werden');
}

function openEditTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    editingTaskId = taskId;
    closeTaskDialog();
    fillTaskForm(task);
    setTaskFormMode('edit');
    openDialog('add-task-dialog');
}

function openCreateTaskDialog(status = 'todo') {
    editingTaskId = null;
    clearTaskform();
    setTaskFormMode('create');
    setFormStatus(status);
    openDialog('add-task-dialog');
}

function fillTaskForm(task) {
    setInputValue('task-title', task.title);
    setInputValue('task-description', task.description);
    setTextContent('selected_category_text', task.category);
    setTaskDate(task.date);
    selectPriority(task.priority);
    setAssignedContacts(task.assignedTo);
    setTaskSubtasks(task.subtasks);
}

function setTaskDate(date) {
    const displayInput = getElement('dateDisplay');
    const dateInput = getElement('dateInput');
    if (!displayInput || !dateInput) return;
    displayInput.value = formatDateForDisplay(date);
    dateInput.value = formatDateForInput(date);
}

function formatDateForDisplay(date) {
    if (!date) return '';
    if (date.includes('/')) {
        return date;
    }
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

function formatDateForInput(date) {
    if (!date) return '';
    if (date.includes('-')) {
        return date;
    }
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
}

function selectPriority(priorityValue) {
    const priorityElement = getElement(`priority-${priorityValue}`);
    if (!priorityElement) return;
    window.colorChangePriority(priorityElement);
}

async function openBoardContactsDropdown() {
    if (!window.contactsList?.length) {
        await loadBoardContacts();
    }
    dropdownContactsDown();
}


function setAssignedContacts(assignedTo) {
    selectedContacts = normalizeContacts(assignedTo);
    showSelectedContacts();
}

function normalizeContacts(assignedTo) {
    if (!assignedTo) return [];
    const contacts = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.split(',');
    return contacts
        .map(getContactObject)
        .filter(Boolean);
}

function getContactObject(contact) {
    return isContactObject(contact)
        ? normalizeContactObject(contact)
        : createContactObject(contact);
}

function isContactObject(contact) {
    return typeof contact === 'object' && contact?.name;
}

function normalizeContactObject(contact) {
    const contactData = findContactByName(contact.name);
    return {
        name: contact.name,
        shortName: getContactShortName(contact, contactData),
        color: getContactColor(contact, contactData)
    };
}

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

function getContactShortName(contact, contactData) {
    return contact?.shortName
        ?? contact?.shortname
        ?? contactData?.shortName
        ?? contactData?.shortname
        ?? contactListInitials(contactData?.name ?? contact?.name ?? '');
}

function getContactColor(contact, contactData) {
    return contact?.color
        ?? contactData?.color
        ?? '#2A3647';
}

function findContactByName(contactName) {
    const normalizedName = contactName.trim().toLowerCase();

    return boardContacts.find(
        contact =>
            contact.name.trim().toLowerCase() === normalizedName
    );
}

function contactListInitials(contactName) {
    return contactName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('');
}

function getInitials(contactName, contactData) {
    return contactData
        ? contactListInitials(contactData.name)
        : contactName.slice(0, 2).toUpperCase();
}

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

function setTaskSubtasks(taskSubtasks) {
    window.setAddTaskSubtasks(taskSubtasks);
}

async function saveTask(event) {
    console.log('saveTask gestartet');
    console.log('editingTaskId', editingTaskId);    
    event.preventDefault();
    const defaultStatus =
        document.getElementById('add-task-dialog').dataset.status || 'todo';
    const task = getTaskFormData(defaultStatus);
    console.log('Task-Daten beim Speichern:', task);
    if (!isTaskValid(task)) return;
    try {
        await persistTask(task);
        await finishSavingTask();
    } catch (error) {
        console.error('Task konnte nicht gespeichert werden:', error);
    }
}

async function persistTask(taskData) {
    if(!editingTaskId){
        return window.addTaskToFirebase(taskData)
    }
    const existingTask = getTaskById(editingTaskId);
    if (!existingTask){
        throw new Error('Der zu bearbeitende Task wurde nicht gefunden.');
    }
    return updateTaskInFirebase(existingTask, taskData)
}

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

async function toggleTaskSubtask(index) {
    const task = fetchedTasks.find(task => task.id === currentTaskId);
    if (!task || !Array.isArray(task.subtasks) || !task.subtasks[index]) {
        console.error('Task oder Subtask wurde nicht gefunden');
        return;
    }
    task.subtasks[index].completed = !task.subtasks[index].completed;
    try {
        await updateTaskSubtasksInFirebase(task, task.subtasks);
        await reloadBoard();
        openTaskDetails(task.id);
    } catch (error) {
        task.subtasks[index].completed = !task.subtasks[index].completed;
        console.error('Subtask konnte nicht aktualisiert werden:', error);
    }
}

async function updateTaskSubtasksInFirebase(task, subtasks) {
    const taskPath = task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
    const response = await fetch(
        `${BASE_URL}${taskPath}.json`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subtasks: subtasks,
            }),
        }
    );
    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `${response.status}: ${errorText}`
        );
    }
}

function getCompletedSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) {
        return 0;
    }
    return subtasks.filter(subtask => subtask.completed).length;
}

function getSubtaskProgress(subtasks) {
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
        return 0;
    }
    return Math.round(
        (getCompletedSubtasks(subtasks) / subtasks.length) * 100
    );
}

function hasSubtasks(task) {
    return Array.isArray(task.subtasks) && task.subtasks.length > 0;
}

function getSelectedContactNames() {
    const contacts = window.getSelectedContacts?.() ?? [];
    return contacts
        .map(contact => contact.name)
        .join(', ');
}

function isTaskValid(task) {
    formRequired();

    return Boolean(
        task.title &&
        task.date &&
        task.priority &&
        isValidCategory(task.category)
    );
}

function isValidCategory(category) {
    return Boolean(
        category &&
        category !== 'Select task category' &&
        category !== 'Select Task Category'
    );
}

async function updateTaskInFirebase(existingTask, taskData) {
    const taskPath = existingTask.userId
        ? `tasks/${existingTask.userId}/${existingTask.id}`
        : `tasks/${existingTask.id}`;
    const url = `${BASE_URL}${taskPath}.json`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(
            `Task-Update fehlgeschlagen: ${response.status} – ${responseText}`
        );
    }
    return responseText ? JSON.parse(responseText) : null;
}

async function finishSavingTask() {
    resetTaskFormState();
    clearTaskform();
    closeDialog('add-task-dialog');
    setTaskFormMode('create');
    await reloadBoard();
}

function resetTaskFormState() {
    editingTaskId = null;
    priority = [];
    selectedContacts = [];
}

function setFormStatus(status) {
    const dialog = getElement('add-task-dialog');
    if (!dialog) return;
    dialog.dataset.status = status;
}

function getTaskById(taskId) {
    return fetchedTasks.find(task => task.id === taskId);
}

function getInputValue(id) {
    return getElement(id)?.value.trim() ?? '';
}

function setInputValue(id, value) {
    const element = getElement(id);
    if (!element) return;
    element.value = value ?? '';
}

function getTextContent(id) {
    return getElement(id)?.textContent.trim() ?? '';
}

function setTextContent(selector, value, useSelector = false) {
    const element = useSelector
        ? document.querySelector(selector)
        : getElement(selector);
    if (!element) return;
    element.textContent = value ?? '';
}

function getElement(id) {
    return document.getElementById(id);
}

function openDialog(id) {
    getElement(id)?.showModal();
}

function closeDialog(id) {
    getElement(id)?.close();
}

function validateResponse(response, message) {
    if (!response.ok) {
        throw new Error(`${message}: ${response.status}`);
    }
}

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

function searchTasks(){
    currentSearch = document.getElementById('search-input')
    .value.trim();
    renderBoard();
}

function taskSuccessfullyCreatedDialog() {
    const successDialog = document.getElementById('task_dialog_success_id');
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
    }, 2000);
}

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

function eventListenerDeleteTaskDialog(taskId, deleteButton, cancelButton, deleteDialog) {
    deleteButton.onclick = async () => {
        await deleteTask(taskId);
        deleteDialog.close();
    };
    cancelButton.onclick = () => {
        deleteDialog.close();
    };
}

function getPreviousStatus(currentStatus){
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if(currentIndex <= 0){
        return null;
    }
    return STATUS_ORDER[currentIndex - 1];
}

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

function handleTaskCardClick(event, taskId){
    if(event.target.closest('.move-task-wrapper')){
        return;
    }
    openTaskDetails(taskId);
}

function toggleMoveTaskMenu(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById(`move-task-menu-${taskId}`);
    if (!menu) {
        console.error('Move-Menü wurde nicht gefunden:', taskId);
        return;
    }
    menu.classList.toggle('move-task-menu-open');
}

async function moveTaskToStatus(event, taskId, newStatus) {
    event.preventDefault();
    event.stopPropagation();
    const task = getTaskById(taskId);
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Task konnte nicht verschoben werden', error);
    }
}