window.subtasks = [];

document.getElementById('task-subtasks').addEventListener('keydown', addSubtask);

/**
 * Handle Enter key presses to add a new subtask.
 *
 * @param {KeyboardEvent} event - The keyboard event from the subtask input.
 */
function addSubtask(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = event.target;
    const title = input.value.trim();
    if (!title) return;
    window.subtasks.push({
        title,
        completed: false
    });
    input.value = '';
    renderAddTaskSubtasks();
}

/**
 * Render the current subtask list inside the add task form.
 */
function renderAddTaskSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    list.innerHTML = window.subtasks
        .map(subtask => `<div>${subtask.title}</div>`)
        .join('');
}

/**
 * Set the current subtasks from provided data and refresh the UI.
 *
 * @param {Array<{title:string,completed:boolean}>|string} taskSubtasks - Subtasks data or a single subtask title.
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
 * Replace the current subtask list with the provided subtasks.
 *
 * @param {Array<{title:string,completed:boolean}>|string} taskSubtasks - Array of subtasks or a single subtask title.
 */
function setSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        window.subtasks = taskSubtasks.map(subtask => ({ ...subtask }));
    } else if (typeof taskSubtasks === 'string' && taskSubtasks.trim()) {
        setSingleSubtask(taskSubtasks);
    } else {
        window.subtasks = [];
    }
}

/**
 * Set a single subtask as the current subtasks state.
 *
 * @param {string} taskSubtasks - Title of the single subtask.
 */
function setSingleSubtask(taskSubtasks) {
    window.subtasks = [{ title: taskSubtasks.trim(), completed: false }];
}

/**
 * Clear all subtasks from the current add task form.
 */
function resetSubtasks() {
    window.subtasks = [];
    renderAddTaskSubtasks();
}

window.addSubtask = addSubtask;
window.resetSubtasks = resetSubtasks;