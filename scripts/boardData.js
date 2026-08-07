/**
 * Fetch tasks from Firebase Realtime Database and normalize the result.
 * @param {string} [path='tasks'] - Firebase path to fetch (e.g. 'tasks' or 'tasks/{userId}').
 * @returns {Promise<Array>} Array of normalized task objects.
 */
async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        fetchedTasks = normalizeFetchedTasks(data);
        return fetchedTasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        fetchedTasks = [];
        return [];
    }
}

/**
 * Build request options for JSON-based fetch calls.
 * @param {string} method - HTTP method for the request.
 * @param {Object} data - Payload to serialize as JSON.
 * @returns {{method:string, headers:Object, body:string}}
 */
function getJsonRequestOptions(method, data) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
}

/**
 * Parse a Firebase REST response and return the JSON payload.
 * @param {Response} response - Fetch response object.
 * @param {string} errorMessage - Error message prefix for failures.
 * @returns {Promise<unknown|null>} Parsed response body, or null for empty responses.
 * @throws {Error} If the response is not ok.
 */
async function parseFirebaseResponse(response, errorMessage) {
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(
            `${errorMessage}: ${response.status} – ${responseText}`
        );
    }
    return responseText
        ? JSON.parse(responseText)
        : null;
}

/**
 * Normalize tasks stored under a user-specific Firebase node.
 * @param {string} userId - Firebase user id that owns the task list.
 * @param {Object} userTasks - Object containing tasks keyed by task id.
 * @returns {Array<Object>} Array of normalized task objects.
 */
function normalizeUserTasks(userId, userTasks) {
    return Object.entries(userTasks ?? {})
        .filter(([, task]) => isTaskObject(task))
        .map(([taskId, task]) => ({
            ...task,
            id: taskId,
            userId,
        }));
}

/**
 * Convert raw Firebase result data into a flat array of task objects.
 * Supports both top-level task entries and nested user task maps.
 * @param {Object} data - Raw data returned by Firebase.
 * @returns {Array<Object>} Normalized list of task objects.
 */
function normalizeFetchedTasks(data) {
    return Object.entries(data ?? {}).flatMap(
        ([firstLevelId, value]) => {
            if (isTaskObject(value)) {
                return [{
                    ...value,
                    id: firstLevelId,
                }];
            }
            return normalizeUserTasks(firstLevelId, value);
        }
    );
}

/**
 * Heuristic to determine whether a value looks like a task object.
 * @param {unknown} value
 * @returns {boolean}
 */
function isTaskObject(value) {
    return (
        value &&
        typeof value === 'object' &&
        typeof value.title === 'string' &&
        typeof value.status === 'string'
    );
}

/**
 * Return the Firebase storage path for a task.
 * @param {Object} task - Task object containing `id` and optional `userId`.
 * @returns {string}
 */
function getTaskPath(task) {
    return task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
}

/**
 * Update only the `status` field of a task in Firebase.
 * @param {Object} task - Task object containing `id` and optional `userId`.
 * @param {string} status - New status value.
 * @returns {Promise<void>}
 */
async function updateTaskStatus(task, status) {
    const taskPath = task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
    const response = await fetch(`${BASE_URL}${taskPath}.json`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status,
            }),
        }
    );
    validateResponse(response, 'Status update failed')
}

/**
 * Delete a task in Firebase using its object (id and optional userId).
 * @param {Object} task
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirebase(task) {
    const taskPath = task.userId
        ? `tasks/${task.userId}/${task.id}`
        : `tasks/${task.id}`;
    const response = await fetch(
        `${BASE_URL}${taskPath}.json`,
        {
            method: 'DELETE',
        }
    );
    validateResponse(response, 'Failed to delete task');
}

/**
 * Replace an existing task in Firebase (PUT) with provided task data.
 * @param {Object} existingTask
 * @param {Object} taskData
 * @returns {Promise<Object|null>} Parsed response or null
 */
async function updateTaskInFirebase(existingTask, taskData) {
    const response = await fetch(
        `${BASE_URL}${getTaskPath(existingTask)}.json`,
        getJsonRequestOptions('PUT', taskData)
    );

    return parseFirebaseResponse(
        response,
        'Task update failed'
    );
}

/**
 * Persist updated subtasks array for a task to Firebase.
 * @param {Object} task
 * @param {Array} subtasks
 * @returns {Promise<void>}
 */
async function updateTaskSubtasksInFirebase(task, subtasks) {
    const response = await fetch(
        `${BASE_URL}${getTaskPath(task)}.json`,
        getJsonRequestOptions('PATCH', { subtasks })
    );

    await parseFirebaseResponse(
        response,
        'Subtasks konnten nicht aktualisiert werden'
    );
}