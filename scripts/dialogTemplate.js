function getTaskDialogTemplate(task) {
    return `<article class="task-dialog-content">
    <span class="card-head" ${categoryStyles[task.category] ?? ''}>
        4{task.category}
    </span>
    <h2>${task.title}</h2>
    <p class="task-dialog-description">
        ${task.description}
    </p>
    <div class="task-dialog-row">
        <span>Due date:</span>
        <span>
            ${task.date}
        </span>
    </div>
    <div class="task-dialog-row">
        <span>Priority:</span>
        <span>
            ${task.priority}
            ${priorityIcons[task.priority] ?? ''}
        </span>
    </div>
    <div class="task-dialog-row">
        <span>Assigned to:</span>
        <span>
            ${task.assignetTo}
        </span>
    </div>
    <div class="task-dialog-row">
        <span>Subtasks:</span>
        <span>
            ${task.subtasks}
        </span>
    </div>
    <div class="task-dialog row">
        <button>Delete</button>
        <button>Edit</button>
    </div>
</article>
`;
}