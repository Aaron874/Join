

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
    deleteSubtaskInput();
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
    window.setSelectedContacts(normalizeContacts(assignedTo));
}

/**
 * Set the task form mode to 'create' or 'edit' and update labels.
 * @param {string} mode
 */
function setTaskFormMode(mode) {
    const clearButton = getElement('clear-task-button');
    const saveButton = getElement('save-task-button');
    const saveButtonText = saveButton.querySelector('.font-size-buttons')
    clearButton.classList.toggle('hidden', mode === 'edit');
    if (saveButtonText) {
        saveButtonText.textContent = mode === 'edit' ? 'Ok' : 'Create Task';
    }
    if (saveButton) {
        saveButton.style.width = mode === 'edit' ? '85px' : '135px';
    }
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
    formRequired();
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
    if (!editingTaskId) {
        return window.addTaskToFirebase(taskData)
    }
    const existingTask = getTaskById(editingTaskId);
    if (!existingTask) {
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
        assignedTo: addTaskState.selectedContacts.map(contact => ({
            name: contact.name,
            shortName: contact.shortName,
            color: contact.color
        })),
        category: getTextContent('selected_category_text'),
        subtasks: [...addTaskState.subtasks],
        status: existingTask?.status ?? defaultStatus,
    };
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