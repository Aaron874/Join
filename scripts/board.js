
/**
 * Board module
 *
 * Responsible for loading, rendering and managing tasks on the board
 * (drag & drop, create, update, delete). Interacts with Firebase
 * Realtime Database and provides utility helpers for task UI.
 */
window.addEventListener('DOMContentLoaded', initBoard);

const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/'

const COLUMN_IDS = {
    todo: 'todo-container',
    inProgress: 'progress-container',
    awaitFeedback: 'feedback-container',
    done: 'done-container',
};

const STATUS_ORDER = [
    'todo',
    'inProgress',
    'awaitFeedback',
    'done'
];

const STATUS_LABELS = {
    todo: 'To Do',
    inProgress: 'In Progress',
    awaitFeedback: 'Await Feedback',
    done: 'Done'
};

const EMPTY_COLUMN_TEXTS = {
    todo: 'No tasks To do',
    inProgress: 'No tasks in progress',
    awaitFeedback: 'No tasks await feedback',
    done: 'No tasks done',
};

let fetchedTasks = [];
let fetchedContacts = [];
let draggedTaskId;
let editingTaskId;
let currentTaskId;
let currentSearch = '';

/**
 * Initialize the board.
 * Loads board contacts, fetches tasks and initializes drag-and-drop.
 * @returns {Promise<void>}
 */
async function initBoard() {
    await loadBoardContacts();
    await reloadBoard();
    initDragAndDrop();
}

/**
 * Reloads the board data by fetching latest tasks and re-rendering.
 * @returns {Promise<void>}
 */
async function reloadBoard() {
    await fetchTasks();
    renderBoard();

}

/**
 * Create a new task in Firebase.
 * @param {Object} task - Task payload to POST
 * @returns {Promise<Object>} Parsed JSON response from Firebase
 */
async function createTaskInFirebase(task) {
    const response = await fetch(`${BASE_URL}tasks.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    validateResponse(response, 'Failed to create task');
    return response.json();
}

/**
 * Normalize assignedTo into an array of contact objects.
 * @param {string|Array|Object} assignedTo
 * @returns {Array<Object>}
 */
function normalizeContacts(assignedTo) {
    if (!assignedTo) return [];
    const contacts = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.split(',');
    return contacts
        .map(getContactObject)
        .filter(Boolean);
}

/**
 * Convert a contact item (string or object) into a canonical contact object.
 * @param {string|Object} contact
 * @returns {Object|null}
 */
function getContactObject(contact) {
    return isContactObject(contact)
        ? normalizeContactObject(contact)
        : createContactObject(contact);
}

/**
 * Check whether the provided value is a contact object with a name.
 * @param {unknown} contact
 * @returns {boolean}
 */
function isContactObject(contact) {
    return typeof contact === 'object' && contact?.name;
}

/**
 * Normalize a contact object by enriching with shortName and color from
 * the board contacts if available.
 * @param {Object} contact
 * @returns {Object}
 */
function normalizeContactObject(contact) {
    const contactData = findContactByName(contact.name);
    return {
        name: contact.name,
        shortName: getContactShortName(contact, contactData),
        color: getContactColor(contact, contactData)
    };
}

/**
 * Create a contact object from a string name, attempting to enrich from
 * existing board contacts.
 * @param {string} contact
 * @returns {Object|null}
 */
function createContactObject(contact) {
    const contactName = String(contact).trim();
    if (!contactName) return null;
    const contactData = findContactByName(contactName);
    return {
        name: contactData?.name ?? contactName,
        shortName: getContactShortName(contactData, contactData),
        color: getContactColor(contactData, contactData)
    };
}

/**
 * Determine a short display name (initials) for a contact.
 * @param {Object} contact
 * @param {Object} contactData
 * @returns {string}
 */
function getContactShortName(contact, contactData) {
    return contact?.shortName
        ?? contact?.shortname
        ?? contactData?.shortName
        ?? contactData?.shortname
        ?? contactListInitials(contactData?.name ?? contact?.name ?? '');
}

/**
 * Get display color for a contact, falling back to a default.
 * @param {Object} contact
 * @param {Object} contactData
 * @returns {string}
 */
function getContactColor(contact, contactData) {
    return contact?.color
        ?? contactData?.color
        ?? '#2A3647';
}

/**
 * Find a contact in the `boardContacts` array by name (case-insensitive).
 * @param {string} contactName
 * @returns {Object|undefined}
 */
function findContactByName(contactName) {
    const normalizedName = contactName.trim().toLowerCase();
    return boardContacts.find(
        contact =>
            contact.name.trim().toLowerCase() === normalizedName
    );
}

/**
 * Build initials from a contact name (first two words).
 * @param {string} contactName
 * @returns {string}
 */
function contactListInitials(contactName) {
    return contactName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('');
}

/**
 * Return initials for a contact, preferring provided contactData.
 * @param {string} contactName
 * @param {Object} contactData
 * @returns {string}
 */
function getInitials(contactName, contactData) {
    return contactData
        ? contactListInitials(contactData.name)
        : contactName.slice(0, 2).toUpperCase();
}

/**
 * Return comma-separated names of currently selected contacts from the global helper.
 * @returns {string}
 */
function getSelectedContactNames() {
    const contacts = window.getSelectedContacts?.() ?? [];
    return contacts
        .map(contact => contact.name)
        .join(', ');
}

/**
 * Validate that required fields for a task are present.
 * Triggers `formRequired()` UI helper and returns boolean validity.
 * @param {Object} task
 * @returns {boolean}
 */
function isTaskValid(task) {
    return Boolean(
        task.title &&
        task.date &&
        task.priority &&
        isValidCategory(task.category)
    );
}

/**
 * Validate the selected task category is not the placeholder value.
 * @param {string} category
 * @returns {boolean}
 */
function isValidCategory(category) {
    return Boolean(
        category &&
        category !== 'Select task category' &&
        category !== 'Select Task Category'
    );
}

/**
 * Find a task in the cached `fetchedTasks` by id.
 * @param {string} taskId
 * @returns {Object|undefined}
 */
function getTaskById(taskId) {
    return fetchedTasks.find(task => task.id === taskId);
}