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
    const previewText = getPreviewText(task.description);

    return `
        <article
            class="task-card"
            draggable="true"
            data-task-id="${task.id}"
            onclick="openTaskDetails('${task.id}')"
            ondragstart="handleDragStart(event)"
            ondragend="handleDragEnd(event)"
        >
            <span class="card-head ${categoryClass}">
                ${task.category}
            </span>

            <h3>${task.title}</h3>

            <p class="task-description">
                ${previewText}
            </p>

            <div class="task-card-bottom">
                ${getTaskContactIconsTemplate(task.assignedTo)}
                ${priorityIcon}
            </div>
        </article>
    `;
}

function getTaskContactIconsTemplate(assignedTo) {
    const contacts = normalizeContacts(assignedTo);

    return `
        <div class="task-card-contacts">
            ${contacts.map(getTaskContactIconTemplate).join('')}
        </div>
    `;
}

function getTaskContactIconTemplate(contact, index) {
    return `
        <span
            class="task-card-contact"
            style="
                --contact-color: ${contact.color};
                --contact-index: ${index};
            "
            title="${contact.name}"
        >
            ${contact.shortName}
        </span>
    `;
}

function getTaskDetailsContactsTemplate(assignedTo) {
    const contacts = normalizeContacts(assignedTo);

    if (!contacts.length) {
        return '<p>No contacts assigned</p>';
    }

    return `
        <div class="task-details-contacts">
            ${contacts.map(getTaskDetailsContactTemplate).join('')}
        </div>
    `;
}

function getTaskDetailsContactTemplate(contact) {
    return `
        <div class="task-details-contact">
            <span
                class="task-details-contact-icon"
                style="--contact-color: ${contact.color};"
            >
                ${contact.shortName}
            </span>

            <span class="task-details-contact-name">
                ${contact.name}
            </span>
        </div>
    `;
}