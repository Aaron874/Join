window.subtasks = [];

document.getElementById('task-subtasks').addEventListener('keydown', addSubtask);

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

function renderAddTaskSubtasks() {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    list.innerHTML = window.subtasks
        .map(subtask => `<div>${subtask.title}</div>`)
        .join('');
}

window.setAddTaskSubtasks = function (taskSubtasks) {
    setSubtasks(taskSubtasks);
    const input = document.getElementById('task-subtasks');
    if (input) {
        input.value = '';
    }
    renderAddTaskSubtasks();
};

function setSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        window.subtasks = taskSubtasks.map(subtask => ({ ...subtask }));
    } else if (typeof taskSubtasks === 'string' && taskSubtasks.trim()) {
        setSingleSubtask(taskSubtasks);
    } else {
        window.subtasks = [];
    }
}

function setSingleSubtask(taskSubtasks) {
    window.subtasks = [{ title: taskSubtasks.trim(), completed: false }];
}

function resetSubtasks() {
    window.subtasks = [];
    renderAddTaskSubtasks();
}

window.addSubtask = addSubtask;
window.resetSubtasks = resetSubtasks;