window.subtasks = [];

document.getElementById('task-subtasks').addEventListener('keydown', addSubtask);

function createSubtask() {
    const input = document.getElementById('task-subtasks');
    const title = input.value.trim();

    if (!title) return;

    window.subtasks.push({
        title,
        completed: false
    });

    input.value = '';
    renderAddTaskSubtasks();
}

function addSubtask(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    createSubtask();
}

/**
 * Handle Enter key presses to add a new subtask.
 *
 * @param {KeyboardEvent} event - The keyboard event from the subtask input.
 */
// function addSubtask(event) {
//     if (event.key !== 'Enter') return;
//     event.preventDefault();
//     const input = event.target;
//     const title = input.value.trim();
//     if (!title) return;
//     window.subtasks.push({
//         title,
//         completed: false
//     });
//     input.value = '';
//     renderAddTaskSubtasks();
// }

/**
 * Render the current subtask list inside the add task form.
 */
function renderAddTaskSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    list.innerHTML = window.subtasks
        .map((subtask, index) => getSubtaskTemplate(subtask, index))
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
 * Delete a subtask at the specified index and refresh the UI.
 *
 * @param {number} index - The index of the subtask to delete.
 */
function deleteSubtask(index) {
    window.subtasks.splice(index, 1);
    renderAddTaskSubtasks();
}

/**
 * Enable edit mode for a subtask by replacing it with an input field.
 *
 * @param {number} index - The index of the subtask to edit.
 */
function editSubtask(index) {
    const item = document.querySelectorAll('.subtask-item')[index];
    const title = window.subtasks[index].title;
    item.innerHTML = `
        <input
            class="subtask-edit-input"
            value="${title}"
            onkeydown="if(event.key === 'Enter') saveSubtaskEdit(${index})">
        <button type="button" onclick="saveSubtaskEdit(${index})">✓</button>
    `;
    item.querySelector('input').focus();
}

/**
 * Save the edited subtask and refresh the UI.
 *
 * @param {number} index - The index of the subtask to save.
 */
function saveSubtaskEdit(index) {
    const input = document.querySelectorAll('.subtask-item')[index]
        .querySelector('input');
    if (!input.value.trim()) return;
    window.subtasks[index].title = input.value.trim();
    renderAddTaskSubtasks();
}

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

function deleteSubtaskInput() {
    const subtaskInput = document.getElementById('task-subtasks');
    subtaskInput.value = '';

}

window.addSubtask = addSubtask;
window.resetSubtasks = resetSubtasks;
window.editSubtask = editSubtask;
window.saveSubtaskEdit = saveSubtaskEdit;
window.deleteSubtask = deleteSubtask;
window.deleteSubtaskInput = deleteSubtaskInput;
window.createSubtask = createSubtask;