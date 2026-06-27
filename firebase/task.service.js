import {
    ref,
    push,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    db,
    auth
} from "./firebase.config.js";

/**
 * Gibt die UID des aktuell angemeldeten Benutzers zurück.
 * @returns {string}
 */
function getUserId() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Kein Benutzer angemeldet.");
    }

    return user.uid;
}

/**
 * Erstellt eine neue Task.
 * @param {Object} task
 * @returns {Promise}
 */
export async function createTask(task) {
    const uid = getUserId();

    return push(
        ref(db, `tasks/${uid}`),
        task
    );
}

/**
 * Lädt alle Tasks des aktuellen Benutzers.
 * @returns {Promise<Array>}
 */
export async function getTasks() {
    const uid = getUserId();

    const snapshot = await get(
        ref(db, `tasks/${uid}`)
    );

    if (!snapshot.exists()) {
        return [];
    }

    return Object.entries(snapshot.val()).map(([id, task]) => ({
        id,
        ...task
    }));
}

/**
 * Lädt genau eine Task.
 * @param {string} taskId
 * @returns {Promise<Object|null>}
 */
export async function getTask(taskId) {
    const uid = getUserId();

    const snapshot = await get(
        ref(db, `tasks/${uid}/${taskId}`)
    );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: taskId,
        ...snapshot.val()
    };
}

/**
 * Aktualisiert eine komplette Task.
 * @param {string} taskId
 * @param {Object} updatedTask
 */
export async function updateTask(taskId, updatedTask) {
    const uid = getUserId();

    return update(
        ref(db, `tasks/${uid}/${taskId}`),
        updatedTask
    );
}

/**
 * Aktualisiert nur den Status.
 * @param {string} taskId
 * @param {string} status
 */
export async function updateTaskStatus(taskId, status) {
    const uid = getUserId();

    return update(
        ref(db, `tasks/${uid}/${taskId}`),
        {
            status
        }
    );
}

/**
 * Löscht eine Task.
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
    const uid = getUserId();

    return remove(
        ref(db, `tasks/${uid}/${taskId}`)
    );
}