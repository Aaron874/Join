import {
    ref,
    push,
    get,
    update,
    remove,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

import { db, auth } from './firebase-config.js';

/**
 * Gibt die UID des aktuell angemeldeten Benutzers zurück.
 * @returns {string}
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
 * Erstellt eine neue Task.
 * @param {Object} task
 * @returns {Promise}
 */
export async function createTask(task) {
    return push(ref(db, getUserPath('tasks')), task);
}

/**
 * Lädt alle Tasks des aktuellen Benutzers.
 * @returns {Promise<Array>}
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
 * Lädt genau eine Task.
 * @param {string} taskId
 * @returns {Promise<Object|null>}
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
 * Aktualisiert eine komplette Task.
 * @param {string} taskId
 * @param {Object} updatedTask
 */
export async function updateTask(taskId, updatedTask) {
    return update(ref(db, `${getUserPath('tasks')}/${taskId}`), updatedTask);
}

/**
 * Aktualisiert nur den Status.
 * @param {string} taskId
 * @param {string} status
 */
export async function updateTaskStatus(task, status) {
    const taskPath = task.userId ? `tasks/${task.userId}/${task.id}` : `tasks/${task.id}`;
    return update(ref(db, taskPath), {
        status,
    });
}

/**
 * Löscht eine Task.
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
    return remove(ref(db, `${getUserPath('tasks')}/${taskId}`));
}
