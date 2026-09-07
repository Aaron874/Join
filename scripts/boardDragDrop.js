

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
 * Store the dragged task ID and mark the task card as being dragged.
 * @param {DragEvent} event
 */
function handleDragStart(event) {
    const card = event.currentTarget;
    draggedTaskId = card.dataset.taskId;
    card.classList.add('dragging');
}

/**
 * Clear the drag state and remove all visual drag-and-drop indicators.
 * @param {DragEvent} event
 */
function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    removeAllDropHighlights();
    draggedTaskId = null;
}

/**
 * Allow a drop and highlight the column when the task can change to its status.
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    event.preventDefault();
    const task = getTaskById(draggedTaskId);
    const column = event.currentTarget;
    if (!task || task.status === column.dataset.status) {
        removeDropHighlight(column);
        return;
    }
    addDropHighlight(column);
}

/**
 * Remove the drop highlight when the dragged task leaves a task column.
 *
 * The highlight is kept while moving between elements inside the same column.
 * @param {DragEvent} event
 */
function handleDragLeave(event) {
    const column = event.currentTarget;
    if (column.contains(event.relatedTarget)) return;
    removeDropHighlight(column);
}

/**
 * Move the dragged task to the column's status and reload the board.
 * @param {DragEvent} event
 * @returns {Promise<void>}
 */
async function handleDrop(event) {
    event.preventDefault();
    removeDropHighlight(event.currentTarget);
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
     * Add a drop highlight to a task column if it does not already have one.
     * @param {HTMLElement} column
     * @returns {void}
     */
function addDropHighlight(column) {
    if (column.querySelector('.highlight')) return;
    const highlight = document.createElement('div');
    highlight.classList.add('highlight');
    column.appendChild(highlight);
}

/**
 * Remove the drop highlight from a task column.
 * @param {HTMLElement} column
 * @returns {void}
 */
function removeDropHighlight(column) {
    column.querySelector('.highlight')?.remove();
}

/**
 * Remove all drop highlights from the board.
 * @returns {void}
 */
function removeAllDropHighlights() {
    document.querySelectorAll('.highlight')
        .forEach(highlight => highlight.remove());
}

/**
 * Return the status immediately before the current status in the workflow.
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
 * Return the status immediately after the current status in the workflow.
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
 * Open task details unless the click originated inside the move-task menu.
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
 * Toggle the move-task menu for a specific task card.
 * @param {MouseEvent} event
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
 * Move a task to a new status through the move-task menu.
 * @param {MouseEvent} event
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