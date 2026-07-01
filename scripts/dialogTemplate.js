function getTaskDialogTemplate(task) {
    const categoryClass = categoryStyles[task.category] ?? '';
    const priorityIcon = priorityIcons[task.priority] ?? '';

    return `
        <article class="task-dialog-content">
            <button class="task-dialog-close" onclick="closeTaskDialog()">
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
                <p>${task.assignedTo}</p>
            </div>

            <div class="task-dialog-section">
                <h3>Subtasks</h3>
                <p>${task.subtasks}</p>
            </div>

            <div class="task-dialog-footer">
                <button>Delete</button>
                <span></span>
                <button>Edit</button>
            </div>
        </article>
    `;
}