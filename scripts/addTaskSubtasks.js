window.subtasks = [];

let editingSubtaskIndex = null;

document.getElementById('task-subtasks').addEventListener('keydown', addSubtask);

/**
 * Creates a new subtask from the current input value.
 * 
 * @returns {void}
 */
function createSubtask() {
    const input = document.getElementById('task-subtasks');
    const title = input.value.trim();
    if (!title) return;
    window.subtasks.push({
        title,
        completed: false,
    });
    input.value = '';
    renderAddTaskSubtasks();
}

/**
 * Confirms the current subtask when the Enter key is pressed.
 *
 * @param {KeyboardEvent} event - The keyboard event triggered by the input.
 * @returns {void}
 */
function addSubtask(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    createSubtask();
}

/**
 * Renders the current subtask list inside the Add Task form.
 * 
 * @returns {void}
 */
function renderAddTaskSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;

    list.innerHTML = window.subtasks
        .map((subtask, index) => getSubtaskTemplate(subtask, index))
        .join('');

    list.classList.toggle('scrollable', window.subtasks.length > 4);
}

/**
 * Sets the current subtasks from provided data and refreshes the UI.
 *
 * @param {Array<{title:string,completed:boolean}>|string} taskSubtasks - Subtasks data or a single subtask title.
 * @returns {void}
 */
window.setAddTaskSubtasks = function (taskSubtasks) {
    setSubtasks(taskSubtasks);
    const input = document.getElementById('task-subtasks');
    if (input) {
        input.value = '';
    }
    renderAddTaskSubtasks();
};

/**
 * Deletes a subtask at the specified index and refreshes the UI.
 *
 * @param {number} index - The index of the subtask to delete.
 * @returns {void}
 */
function deleteSubtask(index) {
    window.subtasks.splice(index, 1);
    renderAddTaskSubtasks();
}

/**
 * Resets the currently edited subtask index.
 *
 * @returns {void}
 */
function resetEditingSubtaskIndex() {
    editingSubtaskIndex = null;
}

/**
 * Enables edit mode for the selected subtask.
 *
 * @param {number} index - The index of the subtask to edit.
 * @returns {void}
 */
function editSubtask(index) {
    if (editingSubtaskIndex !== null) {
        return;
    }

    editingSubtaskIndex = index;

    const item = document.querySelectorAll('.subtask-item')[index];
    const title = window.subtasks[index].title;

    item.innerHTML = getEditSubtaskTemplate(index, title);
    item.querySelector('input').focus();
}

/**
 * Saves the edited subtask and refreshes the UI.
 *
 * @param {number} index - The index of the subtask to save.
 * @returns {void}
 */
function saveSubtaskEdit(index) {
    const input = document.querySelectorAll('.subtask-item')[index].querySelector('input');
    if (!input.value.trim()) return;
    window.subtasks[index].title = input.value.trim();
    editingSubtaskIndex = null;
    renderAddTaskSubtasks();
}

/**
 * Replaces the current subtask list with the provided subtasks.
 *
 * @param {Array<{title:string,completed:boolean}>|string} taskSubtasks - Array of subtasks or a single subtask title.
 * @returns {void}
 */
function setSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        window.subtasks = taskSubtasks.map((subtask) => ({ ...subtask }));
    } else if (typeof taskSubtasks === 'string' && taskSubtasks.trim()) {
        setSingleSubtask(taskSubtasks);
    } else {
        window.subtasks = [];
    }
}

/**
 * Sets a single subtask as the current subtasks state.
 *
 * @param {string} taskSubtasks - Title of the single subtask.
 * @returns {void}
 */
function setSingleSubtask(taskSubtasks) {
    window.subtasks = [{ title: taskSubtasks.trim(), completed: false }];
}

/**
 * Clears all subtasks from the current Add Task form.
 * 
 * @returns {void}
 */
function resetSubtasks() {
    window.subtasks = [];
    renderAddTaskSubtasks();
}

/**
 * Clears the subtask input field.
 *
 * @returns {void}
 */
function deleteSubtaskInput() {
    const subtaskInput = document.getElementById('task-subtasks');

    if (!subtaskInput) return;

    subtaskInput.value = '';
}

window.addSubtask = addSubtask;
window.resetSubtasks = resetSubtasks;
window.editSubtask = editSubtask;
window.saveSubtaskEdit = saveSubtaskEdit;
window.deleteSubtask = deleteSubtask;
window.deleteSubtaskInput = deleteSubtaskInput;
window.createSubtask = createSubtask;
window.resetEditingSubtaskIndex = resetEditingSubtaskIndex;
