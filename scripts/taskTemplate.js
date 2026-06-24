const categoryStyles = {
    'Technical Task': 'technical-task',
    'User Story': 'user-story',
};

const priorityIcons = {
    urgent: `
        <svg class="priority-icon urgent" width="20" height="15" viewBox="0 0 18 18" fill="none">
            <path d="M1 10.5L9 5.5L17 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 16L9 11L17 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
    medium: `
        <svg class="priority-icon medium" width="20" height="15" viewBox="0 0 26 18" fill="none">
            <path d="M5 7H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M5 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `,
    low: `
        <svg class="priority-icon low" width="20" height="15" viewBox="0 0 18 18" fill="none">
            <path d="M1 9.5L9 12.5L17 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 4L9 7L17 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
};

function getTaskTemplate(task) {
    const categoryClass = categoryStyles[task.category] ?? '';
    const priorityIcon = priorityIcons[task.priority] ?? '';

    return `
        <article
            class="task-card"
            draggable="true"
            data-task-id="${task.id}"
            ondragstart="handleDragStart(event)"
            ondragend="handleDragEnd(event)"
        >
            <span class="card-head ${categoryClass}">
                ${task.category}
            </span>

            <h3>${task.title}</h3>

            <p class="task-description">
                ${task.description}
            </p>

            <div class="task-card-bottom">
                <span>${task.assignedTo}</span>
                ${priorityIcon}
            </div>
        </article>
    `;
}