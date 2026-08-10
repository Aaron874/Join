/**
 * Build the task dialog HTML template for a task detail view.
 *
 * @param {Object} task - The task data object.
 * @param {string} task.id - Unique task identifier.
 * @param {string} task.title - Task title.
 * @param {string} task.description - Task description.
 * @param {string} task.category - Task category used for styling.
 * @param {string} task.priority - Task priority label.
 * @param {string} task.date - Task due date.
 * @param {Array<Object>} task.assignedTo - Assigned contact list.
 * @param {Array<Object>} task.subtasks - Subtask list.
 * @returns {string} HTML string for the task dialog.
 */
function getTaskDialogTemplate(task) {
const categoryClass = categoryStyles[task.category] ?? '';
const priorityIcon = priorityIcons[task.priority] ?? '';

return `
<article class="task-dialog-content">
    <button class="task-dialog-close" onclick="closeTaskDialog()" type="button">
        ×
    </button>

    <span class="card-head ${categoryClass}">
        ${task.category}
    </span>

    <h2>${task.title}</h2>

    <p class="task-dialog-description">
        ${task.description}
    </p>

    <div class="task-dialog-row">
        <span>Due date:</span>
        <span>${task.date}</span>
    </div>

    <div class="task-dialog-row">
        <span>Priority:</span>

        <span class="task-dialog-priority">
            ${task.priority}
            ${priorityIcon}
        </span>
    </div>

    <div class="task-dialog-section">
        <h3>Assigned To:</h3>

        ${getTaskDetailsContactsTemplate(task.assignedTo)}
    </div>

    <div class="task-dialog-section">
        <h3>Subtasks</h3>
        <p>${getTaskDetailSubtasksTemplate(task.subtasks)}</p>
    </div>

    <div class="task-dialog-footer">
        <button class="delete-btn" onclick="deleteTaskDialog('${task.id}', '${task.title}')" type="button">
            Delete
        </button>
        <span></span>

        <button class="edit-btn" onclick="openEditTask('${task.id}')" type="button">
            Edit
        </button>
    </div>
</article>
`;
}