//Progressbar für Subtasks, mit Wert wievele Subtasks sind erledigt von gesamter Subtask-Liste. Subtasks nach fetch in ein array oder muss schon beim post in ein Array gepackt werden?
//Icons für Zugewiesene Kontakte
//Task description in Vorschautext umbauen
//Dialog mit Taskdetails. (Ohne mit ganzen Task-description text und Subtasks als Text)
//Close-Button in beide dialogs einbauen.
//Add-Task für die jeweiligen Status-Columns einbauen, damit auch ein Task z.B. in Await feedback hinzugefügt werden kann.
//style.css und board.css responsive machen. Ab einer bestimmten Breite soll die Sidebar verschwinden und über ein Burger-Menü im Footer aufrufbar sein. Bisheriges Styling sieht bei Auflösung 3008x1692 super aus. Responsive-Darstellung soll bis 320x480 super aussehen.
//Suchfunktion bauen. Inputfeld und Button existieren schon. es müssen aber mindestens 3 Zeichen im Suchfeld sein, bevor die Suche ausgeführt werden darf.

window.addEventListener('DOMContentLoaded', initBoard);

const COLUMN_IDS = {
    todo: 'todo-container',
    inProgress: 'progress-container',
    awaitFeedback: 'feedback-container',
    done: 'done-container',
};

const EMPTY_COLUMN_TEXTS = {
    todo: 'No tasks To do',
    inProgress: 'No tasks in progress',
    awaitFeedback: 'No tasks await feedback',
    done: 'No tasks done',
};

let fetchedTasks = [];
let draggedTaskId = null;
let editingTaskId = null;

async function initBoard() {
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
        fetchedTasks = Object.entries(data ?? {}).map(([id, task]) => ({
            ...task,
            id,
        }));
        return fetchedTasks;
    } catch (error) {
        console.error('Fehler beim Abrufen:', error);
        fetchedTasks = [];
        return [];
    }
}

function renderBoard() {
    Object.entries(COLUMN_IDS).forEach(([status, containerId]) => {
        renderColumn(status, getElement(containerId));
    });
}

function renderColumn(status, container) {
    if (!container) return;
    const content = fetchedTasks
        .filter(task => task.status === status)
        .map(getTaskTemplate)
        .join('');

    container.innerHTML = content || getEmptyColumnTemplate(status);
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
        await updateTaskStatus(task.id, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Drop fehlgeschlagen:', error);
    }
}

async function updateTaskStatus(taskId, status) {
    const response = await fetch(
        `${BASE_URL}tasks/${taskId}/status.json`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(status),
        }
    );
    validateResponse(response, 'Status-Update fehlgeschlagen');
    return response.json();
}

function openTaskDetails(taskId) {
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
    const shouldDelete = confirm(
        'Are you sure you want to delete this task?'
    );
    if (!shouldDelete) return;
    try {
        await deleteTaskFromFirebase(taskId);
        closeTaskDialog();
        await reloadBoard();
    } catch (error) {
        console.error('Task konnte nicht gelöscht werden:', error);
    }
}

async function persistTask(task) {
    if (editingTaskId) {
        return updateTaskInFirebase(editingTaskId, task);
    }
    return createTaskInFirebase(task);
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

async function deleteTaskFromFirebase(taskId) {
    const response = await fetch(
        `${BASE_URL}tasks/${taskId}.json`,
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
    setInputValue('task-subtasks', task.subtasks);
    setTextContent('selected_category_text', task.category);
    setTaskDate(task.date);
    selectPriority(task.priority);
    setAssignedContacts(task.assignedTo);
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
    const priorityElement = getElement(
        `priority-${priorityValue}`
    );
    if (!priorityElement) return;
    priority = [];
    colorChangePriority(priorityElement);
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
    if (typeof contact === 'object' && contact.name) {
        return {
            name: contact.name,
            shortName:
                contact.shortName ??
                contact.shortname ??
                contactListInitials(contact.name),
            color: contact.color ?? '#2A3647',
        };
    }
    const contactName = String(contact).trim();
    if (!contactName) return null;
    const contactData = contactsList.find(item =>
        item.name.toLowerCase() === contactName.toLowerCase()
    );
    return {
        name: contactName,
        shortName: contactData
            ? contactListInitials(contactData.name)
            : contactName.slice(0, 2).toUpperCase(),
        color: contactData?.color ?? '#2A3647',
    };
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

async function saveTask(defaultStatus = 'todo') {
    const task = getTaskFormData(defaultStatus);
    if (!isTaskValid(task)) return;
    try {
        await persistTask(task);
        await finishSavingTask();
    } catch (error) {
        console.error('Task konnte nicht gespeichert werden:', error);
    }
}

async function persistTask(task) {
    if (editingTaskId) {
        return updateTaskInFirebase(editingTaskId, task);
    }
    return addTaskToFirebase(task);
}

function getTaskFormData(defaultStatus) {
    const existingTask = getTaskById(editingTaskId);
    return {
        title: getInputValue('task-title'),
        description: getInputValue('task-description'),
        date: getInputValue('dateDisplay'),
        priority: priority.at(-1),
        assignedTo: getSelectedContactNames(),
        category: getTextContent('selected_category_text'),
        subtasks: getInputValue('task-subtasks'),
        status: existingTask?.status ?? defaultStatus,
    };
}

function getSelectedContactNames() {
    return selectedContacts
        .map(contact => contact.name)
        .join(', ');
}

function isTaskValid(task) {
    formRequired();
    return Boolean(
        task.title &&
        task.description &&
        task.date &&
        task.subtasks &&
        task.priority &&
        task.assignedTo &&
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

async function updateTaskInFirebase(taskId, task) {
    const response = await fetch(
        `${BASE_URL}tasks/${taskId}.json`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        }
    );
    validateResponse(response, 'Task-Update fehlgeschlagen');
    return response.json();
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