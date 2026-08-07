

/**
 * Initialize drag and drop listeners for task columns.
 * @returns {void}
 */
function initDragAndDrop() {
    document.querySelectorAll('.task-queue').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

/**
 * Handler for dragstart on a task card. Stores dragged task id.
 * @param {DragEvent} event
 */
function handleDragStart(event) {
    const card = event.currentTarget;
    draggedTaskId = card.dataset.taskId;
    card.classList.add('dragging');
}

/**
 * Handler for dragend on a task card. Clears drag state.
 * @param {DragEvent} event
 */
function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    event.currentTarget.classList.remove('highlight');
    draggedTaskId = null;
}

/**
 * Handler for dragover to allow drop.
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('highlight');

}

function handleDragLeave(event) {
    const column = event.currentTarget;
    if (column.contains(event.relatedTarget)) return;
    column.classList.remove('highlight');
}

/**
 * Handler for drop event on a column. Updates task status and reloads board.
 * @param {DragEvent} event
 * @returns {Promise<void>}
 */
async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('highlight');
    const task = getTaskById(draggedTaskId);
    const newStatus = event.currentTarget.dataset.status;
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Drop failed:', error);
    }
}

/**
 * Get the previous status key in the workflow order, or null if none.
 * @param {string} currentStatus
 * @returns {string|null}
 */
function getPreviousStatus(currentStatus) {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex <= 0) {
        return null;
    }
    return STATUS_ORDER[currentIndex - 1];
}

/**
 * Get the next status key in the workflow order, or null if none.
 * @param {string} currentStatus
 * @returns {string|null}
 */
function getNextStatus(currentStatus) {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (
        currentIndex === -1 ||
        currentIndex >= STATUS_ORDER.length - 1
    ) {
        return null;
    }
    return STATUS_ORDER[currentIndex + 1];
}

/**
 * Handle click on a task card. If the click happened on the move menu wrapper
 * ignore it; otherwise open task details.
 * @param {MouseEvent} event
 * @param {string} taskId
 */
function handleTaskCardClick(event, taskId) {
    if (event.target.closest('.move-task-wrapper')) {
        return;
    }
    openTaskDetails(taskId);
}

/**
 * Toggle the move-task menu visibility for a specific task card.
 * @param {Event} event
 * @param {string} taskId
 */
function toggleMoveTaskMenu(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById(`move-task-menu-${taskId}`);
    if (!menu) {
        console.error('Move menu not found for task:', taskId);
        return;
    }
    menu.classList.toggle('move-task-menu-open');
}

/**
 * Move a task to a new status programmatically (used by move menu).
 * @param {Event} event
 * @param {string} taskId
 * @param {string} newStatus
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(event, taskId, newStatus) {
    event.preventDefault();
    event.stopPropagation();
    const task = getTaskById(taskId);
    if (!task || task.status === newStatus) return;
    try {
        await updateTaskStatus(task, newStatus);
        await reloadBoard();
    } catch (error) {
        console.error('Failed to move task', error);
    }
}