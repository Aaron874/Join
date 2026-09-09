import {
    ref,
    push,
    get,
    update,
    remove,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

import { db, auth } from './firebase-config.js';

/**
 * Builds the database path for the given collection, scoped to the currently authenticated
 * user: anonymous (guest) users share a common "guest" path, while regular users get a path
 * scoped to their unique UID.
 *
 * @param {string} collection - The name of the top-level collection (e.g. "contacts").
 * @throws {Error} If no user is currently authenticated.
 * @returns {string} The user-scoped database path for the given collection.
 */
function getUserPath(collection) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
    }

    if (user.isAnonymous) {
        return `${collection}/guest`;
    }

    return `${collection}/${user.uid}`;
}

/**
 * Creates a new task in the database under the current user's tasks path, generating a new
 * unique key for it.
 *
 * @param {Object} task - The task data to create.
 * @returns {Promise<import('firebase/database').ThenableReference>} A promise resolving to a reference to the newly created task, whose `.key` is the new task's ID.
 */
export async function createTask(task) {
    return push(ref(db, getUserPath('tasks')), task);
}

/**
 * Fetches all tasks for the current user from the database, converting the object keyed by
 * task ID into an array of task objects, each including its ID.
 *
 * @returns {Promise<Array<Object>>} A promise resolving to an array of task objects (each including an "id" field), or an empty array if no tasks exist.
 */
export async function getTasks() {
    const snapshot = await get(ref(db, getUserPath('tasks')));

    if (!snapshot.exists()) {
        return [];
    }

    return Object.entries(snapshot.val()).map(([id, task]) => ({
        id,
        ...task,
    }));
}

/**
 * Fetches a single task by ID for the current user from the database.
 *
 * @param {string|number} taskId - The ID of the task to fetch.
 * @returns {Promise<Object|null>} A promise resolving to the task object (including its "id" field), or null if no task with that ID exists.
 */
export async function getTask(taskId) {
    const snapshot = await get(ref(db, `${getUserPath('tasks')}/${taskId}`));

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: taskId,
        ...snapshot.val(),
    };
}

/**
 * Updates specific fields of an existing task in the database, scoped to the current user's
 * data path.
 *
 * @param {string|number} taskId - The ID of the task to update.
 * @param {Object} updatedTask - An object containing the task fields to update.
 * @returns {Promise<void>} A promise that resolves once the update has been written to the database.
 */
export async function updateTask(taskId, updatedTask) {
    return update(ref(db, `${getUserPath('tasks')}/${taskId}`), updatedTask);
}

/**
 * Updates the status of a task in the database. Uses the task's own userId to build the path
 * if present (e.g. for tasks belonging to another/guest user context), otherwise falls back
 * to a path without a user segment.
 *
 * @param {Object} task - The task to update.
 * @param {string|number} task.id - The task's ID.
 * @param {string} [task.userId] - The ID of the user the task belongs to, if applicable.
 * @param {string} status - The new status value to set on the task.
 * @returns {Promise<void>} A promise that resolves once the update has been written to the database.
 */
export async function updateTaskStatus(task, status) {
    const taskPath = task.userId ? `tasks/${task.userId}/${task.id}` : `tasks/${task.id}`;
    return update(ref(db, taskPath), {
        status,
    });
}

/**
 * Deletes a task by ID from the database for the current user.
 *
 * @param {string|number} taskId - The ID of the task to delete.
 * @returns {Promise<void>} A promise that resolves once the task has been removed from the database.
 */

export async function deleteTask(taskId) {
    return remove(ref(db, `${getUserPath('tasks')}/${taskId}`));
}
