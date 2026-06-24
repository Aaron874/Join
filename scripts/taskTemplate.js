function getTaskTemplate(task) {
    return `
        <article
            class="task-card"
            draggable="true"
            data-task-id="${task.id}"
            ondragstart="handleDragStart(event)"
            ondragend="handleDragEnd(event)"
        >
            <span class="card-head">${task.category}</span>
            <h3>${task.title}</h3>
            <p class="task-description">${task.description}</p>
            <p>${task.subtasks}</p>
            <span>${task.assignedTo}</span>
            <span>${task.priority}</span>
        </article>
    `;
}