const categoryStyles = {
'Technical Task': 'technical-task',
'User Story': 'user-story',
};

const priorityIcons = {
urgent: `
<svg class="priority-icon urgent" width="20" height="15" viewBox="0 0 18 18" fill="none">
    <path d="M1 10.5L9 5.5L17 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" />
    <path d="M1 16L9 11L17 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`,
medium: `
<svg class="priority-icon medium" width="20" height="15" viewBox="0 0 26 18" fill="none">
    <path d="M5 7H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M5 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>
`,
low: `
<svg class="priority-icon low" width="20" height="15" viewBox="0 0 18 18" fill="none">
    <path d="M1 9.5L9 12.5L17 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" />
    <path d="M1 4L9 7L17 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`,
};



function getTaskTemplate(task) {
const categoryClass = categoryStyles[task.category] ?? '';
const priorityIcon = priorityIcons[task.priority] ?? '';
console.log(task.title, task.priority, priorityIcon);
const previewText = getPreviewText(task.description);

return `
<article class="task-card" draggable="true" data-task-id="${task.id}" ondragstart="handleDragStart(event)"
    ondragend="handleDragEnd(event)">
    <div class="task-card-header">
        <span class="card-head ${categoryClass}" onclick="openTaskDetails('${task.id}')">
            ${task.category}
        </span>

        ${getMoveTaskTemplate(task)}
    </div>

    <div class="task-card-content" onclick="openTaskDetails('${task.id}')">
        <h3>${task.title}</h3>

        <p class="task-description">
            ${previewText}
        </p>

        <p>
            ${getSubtaskProgressTemplate(task)}
        </p>

        <div class="task-card-bottom">
            ${getTaskContactIconsTemplate(task.assignedTo)}
            ${priorityIcon}
        </div>
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
<span class="task-card-contact" style="
                --contact-color: ${contact.color};
                --contact-index: ${index};
            " title="${contact.name}">
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
    <span class="task-details-contact-icon" style="--contact-color: ${contact.color};">
        ${contact.shortName}
    </span>

    <span class="task-details-contact-name">
        ${contact.name}
    </span>
</div>
`;
}

function getSubtaskProgressTemplate(task) {
if (!Array.isArray(task.subtasks) || task.subtasks.length === 0) {
return '';
}
const completed = getCompletedSubtasks(task.subtasks);
const total = task.subtasks.length;
const progress = getSubtaskProgress(task.subtasks);
return `
<div class="task-progress">
    <div class="task-progress-bar">
        <div class="task-progress-fill" style="width:${progress}%"></div>
    </div>

    <span>${completed}/${total}</span>
</div>
`;
}

function getMoveTaskTemplate(task) {
const previousStatus = getPreviousStatus(task.status);
const nextStatus = getNextStatus(task.status);

return `
<div class="move-task-wrapper">
    <button class="move-task-button" type="button" draggable="false" aria-label="Move task"
        onclick="toggleMoveTaskMenu(event, '${task.id}')"><svg width="24" height="26" viewBox="0 0 24 26" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="25.25" width="24.5" height="22.5" rx="5.25" transform="rotate(-90 0.75 25.25)"
                stroke="#2A3647" stroke-width="1.5" />
            <mask id="mask0_294678_9763" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="3" width="20"
                height="20">
                <rect x="2" y="23" width="20" height="20" transform="rotate(-90 2 23)" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_294678_9763)">
                <path
                    d="M15.3333 18.1457L16.8958 16.5832C17.0486 16.4304 17.2396 16.354 17.4688 16.354C17.6979 16.354 17.8958 16.4304 18.0625 16.5832C18.2292 16.7498 18.3125 16.9478 18.3125 17.1769C18.3125 17.4061 18.2292 17.604 18.0625 17.7707L15.0833 20.7498C15 20.8332 14.9097 20.8922 14.8125 20.9269C14.7153 20.9616 14.6111 20.979 14.5 20.979C14.3889 20.979 14.2847 20.9616 14.1875 20.9269C14.0903 20.8922 14 20.8332 13.9167 20.7498L10.9167 17.7498C10.75 17.5832 10.6701 17.3887 10.6771 17.1665C10.684 16.9443 10.7708 16.7498 10.9375 16.5832C11.1042 16.4304 11.2986 16.3505 11.5208 16.3436C11.7431 16.3366 11.9375 16.4165 12.1042 16.5832L13.6667 18.1457V12.9998C13.6667 12.7637 13.7465 12.5658 13.9062 12.4061C14.066 12.2464 14.2639 12.1665 14.5 12.1665C14.7361 12.1665 14.934 12.2464 15.0938 12.4061C15.2535 12.5658 15.3333 12.7637 15.3333 12.9998V18.1457ZM10.3333 7.854V12.9998C10.3333 13.2359 10.2535 13.4339 10.0938 13.5936C9.93403 13.7533 9.73611 13.8332 9.5 13.8332C9.26389 13.8332 9.06597 13.7533 8.90625 13.5936C8.74653 13.4339 8.66667 13.2359 8.66667 12.9998V7.854L7.10417 9.4165C6.95139 9.56928 6.76042 9.64567 6.53125 9.64567C6.30208 9.64567 6.10417 9.56928 5.9375 9.4165C5.77083 9.24984 5.6875 9.05192 5.6875 8.82275C5.6875 8.59359 5.77083 8.39567 5.9375 8.229L8.91667 5.24984C9 5.1665 9.09028 5.10748 9.1875 5.07275C9.28472 5.03803 9.38889 5.02067 9.5 5.02067C9.61111 5.02067 9.71528 5.03803 9.8125 5.07275C9.90972 5.10748 10 5.1665 10.0833 5.24984L13.0833 8.24984C13.25 8.4165 13.3299 8.61095 13.3229 8.83317C13.316 9.05539 13.2292 9.24984 13.0625 9.4165C12.8958 9.56928 12.7014 9.64914 12.4792 9.65609C12.2569 9.66303 12.0625 9.58317 11.8958 9.4165L10.3333 7.854Z"
                    fill="#2A3647" />
            </g>
        </svg>


    </button>

    <div class="move-task-menu" id="move-task-menu-${task.id}">
        ${previousStatus ? `
        <button type="button" onclick="moveTaskToStatus(event, '${task.id}', '${previousStatus}')">
            ${STATUS_LABELS[previousStatus]}
        </button>
        ` : ''}

        ${nextStatus ? `
        <button type="button" onclick="moveTaskToStatus(event, '${task.id}', '${nextStatus}')">
            ${STATUS_LABELS[nextStatus]}
        </button>
        ` : ''}
    </div>
</div>
`;
}