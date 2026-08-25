

/**
 * Build HTML for task detail subtasks view.
 * @param {Array|string} taskSubtasks
 * @returns {string} HTML fragment
 */
function getTaskDetailSubtasksTemplate(taskSubtasks) {
    const subtasks = normalizeTaskSubtasks(taskSubtasks);
    if (!subtasks.length) {
        return '<p>No subtasks</p>';
    }
    return subtasks
        .map((subtask, index) => `
        <label class="task-detail-subtask">
            <span>${subtask.title}</span>
            <input class="subtask-checkbox"
                type="checkbox"
                ${subtask.completed ? 'checked' : ''}
                onchange="toggleTaskSubtask(${index})"
            >
        </label>
    `)
        .join('');
}

/**
 * Normalize subtasks field into an array structure.
 * Accepts array or newline/comma-separated string inputs.
 * @param {Array|string|undefined} taskSubtasks
 * @returns {Array}
 */
function normalizeTaskSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        return taskSubtasks;
    }
    if (typeof taskSubtasks === 'string' && taskSubtasks.trim()) {
        return [{
            title: taskSubtasks.trim(),
            completed: false
        }];
    }
    return [];
}

/**
 * Toggle completion state of a subtask for the currently opened task.
 * Updates Firebase and refreshes the UI.
 * @param {number} index - Index of the subtask in the task's subtasks array
 * @returns {Promise<void>}
 */
async function toggleTaskSubtask(index) {
    const task = fetchedTasks.find(task => task.id === currentTaskId);
    if (!task || !Array.isArray(task.subtasks) || !task.subtasks[index]) {
        console.error('Task or subtask not found');
        return;
    }
    task.subtasks[index].completed = !task.subtasks[index].completed;
    try {
        await updateTaskSubtasksInFirebase(task, task.subtasks);
        await reloadBoard();
        openTaskDetails(task.id);
    } catch (error) {
        task.subtasks[index].completed = !task.subtasks[index].completed;
        console.error('Failed to update subtask:', error);
    }
}

/**
 * Count completed subtasks in an array.
 * @param {Array} subtasks
 * @returns {number}
 */
function getCompletedSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) {
        return 0;
    }
    return subtasks.filter(subtask => subtask.completed).length;
}

/**
 * Compute subtask completion progress as a percentage.
 * @param {Array} subtasks
 * @returns {number} percentage (0-100)
 */
function getSubtaskProgress(subtasks) {
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
        return 0;
    }
    return Math.round(
        (getCompletedSubtasks(subtasks) / subtasks.length) * 100
    );
}

/**
 * Check whether a task has subtasks.
 * @param {Object} task
 * @returns {boolean}
 */
function hasSubtasks(task) {
    return Array.isArray(task.subtasks) && task.subtasks.length > 0;
}