import { createTask as createFirebaseTask } from "../firebase/task.service.js";
import {
    initContacts,
    getAssignedContacts,
    getSelectedContacts,
    resetContacts
} from "./addTaskContacts.js";

let priority = "medium";

const priorityConfig = {
    urgent: {
        button: 'priority-urgent', font: 'urgent-font', icon: 'urgent-icon',
        buttonClass: 'style-priorities-red', colorClass: 'color-urgent'
    },
    medium: {
        button: 'priority-medium', font: 'medium-font', icon: 'medium-icon',
        buttonClass: 'style-priorities-orange', colorClass: 'color-medium'
    },
    low: {
        button: 'priority-low', font: 'low-font', icon: 'low-icon',
        buttonClass: 'style-priorities-green', colorClass: 'color-low'
    }
};

window.addEventListener('DOMContentLoaded', initAddTask);
document.addEventListener('DOMContentLoaded', setDefaultPriority);
document.addEventListener('DOMContentLoaded', setMinDate);

document.addEventListener('click', event => {
    if (!event.target.closest('#category-dropdown-wrapper')) {
        dropdownCategoryUp();
    }
});

/**
 * Initializes the Add Task page and loads the contacts.
 *
 * @returns {Promise<void>}
 */
async function initAddTask() {
    try {
        await initContacts();
        document.getElementById("symbole_down_dropdown_category").style.display = "flex";
    } catch (error) {
        console.error("Add Task konnte nicht initialisiert werden:", error);
    }
}

/**
 * Opens the category dropdown.
 *
 * @returns {void}
 */
function dropdownCategoryDown() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'none';
    document.getElementById('symbole_up_dropdown_category').style.display = 'flex';
    document.getElementById('dropdown_category').style.display = 'flex';
}

/**
 * Closes the category dropdown.
 *
 * @returns {void}
 */
function dropdownCategoryUp() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'flex';
    document.getElementById('symbole_up_dropdown_category').style.display = '';
    document.getElementById('dropdown_category').style.display = '';
}

/**
 * Selects a category and displays its name in the category field.
 *
 * @param {HTMLElement} element - The selected category element.
 * @returns {void}
 */

function selectedCatgeory(element) {
    document.getElementById('selected_category_text').textContent =
        element.innerText;

    document.getElementById('category-dropdown-wrapper')
        .classList.remove('error');

    document.getElementById('categoryError')
        ?.classList.remove('show');

    dropdownCategoryUp();
}

/**
 * Gets the DOM elements belonging to a priority configuration.
 *
 * @param {Object} config - Configuration object for a priority.
 * @returns {{button: HTMLElement, font: HTMLElement, icon: HTMLElement}}
 */
function getPriorityElements(config) {
    return {
        button: document.getElementById(config.button),
        font: document.getElementById(config.font),
        icon: document.getElementById(config.icon)
    };
}

/**
 * Removes all active priority styles.
 *
 * @returns {void}
 */
function resetPriorityStyles() {
    Object.values(priorityConfig).forEach(config => {
        const elements = getPriorityElements(config);
        elements.button.classList.remove(config.buttonClass);
        elements.font.classList.remove(config.colorClass);
        elements.icon.classList.remove(config.colorClass);
    });
}

/**
 * Changes the selected priority and applies the corresponding styles.
 *
 * @param {HTMLElement} element - The clicked priority element.
 * @returns {void}
 */
function colorChangePriority(element) {
    resetPriorityStyles();
    const priorityName = element.id.split("-")[1];
    const config = priorityConfig[priorityName];
    const elements = getPriorityElements(config);
    elements.button.classList.add(config.buttonClass);
    elements.font.classList.add(config.colorClass);
    elements.icon.classList.add(config.colorClass);
    priority = priorityName;
}

/**
 * Sets the default priority to medium.
 *
 * @returns {void}
 */ 
function setDefaultPriority() {
    colorChangePriority(document.getElementById('priority-medium'));
}

/**
 * Collects the current form values and returns a task object.
 *
 * @param {*} element - The status value for the task.
 * @returns {Object} The task data.
 */
function getTaskData(element) {
    return {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("task-description").value.trim(),
        date: document.getElementById("dateDisplay").value.trim(),
        subtasks: [...window.subtasks],
        priority: priority,
        assignedTo: getAssignedContacts(),
        category: document.getElementById("selected_category_text").textContent.trim(),
        status: element
    };
}

/**
 * Checks whether the task contains all required values.
 *
 * @param {Object} task - The task object to validate.
 * @returns {boolean} True if the task is valid, otherwise false.
 */
function isTaskValid(task) {
    return task.title &&
        // task.description &&
        task.date &&
        // task.subtasks &&
        // task.priority &&
        task.category !== "Select task category" &&
        task.category 
        // getSelectedContacts().length > 0;
}

/**
 * Creates and saves a task if all required values are valid.
 *
 * @param {*} element - The status value for the task.
 * @returns {Promise<void>}
 */
async function createTask(element) {
    formRequired();
    const task = getTaskData(element);
    if (!isTaskValid(task)) {
        return;
    }
    try {
        await createFirebaseTask(task);
        taskCreatedSuccessfully();
    } catch (error) {
        console.error("Task konnte nicht gespeichert werden:", error);
    }
}

/**
 * Handles the successful creation of a task.
 *
 * @returns {void}
 */
function taskCreatedSuccessfully() {
    priority = "";
    clearTaskform();
}

/**
 * Removes validation error styles from the input fields.
 *
 * @returns {void}
 */
function resetInputErrors() {
    titleInput.classList.remove("error");
    titleError.classList.remove("show");
    dateDisplay.classList.remove("error");
    dateError.classList.remove("show");
    document.getElementById('category-dropdown-wrapper').classList.remove('error');
    document.getElementById('categoryError').classList.remove('show');
}

/**
 * Clears all task input fields and resets the subtasks.
 *
 * @returns {void}
 */
function resetTaskFields() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("dateDisplay").value = "";
    document.getElementById("task-subtasks").value = "";
    document.getElementById("selected_category_text").textContent = "Select task category";
    window.resetSubtasks();
}

/**
 * Resets contacts, priority styles and the category dropdown.
 *
 * @returns {void}
 */
function resetTaskUI() {
    resetContacts();
    resetPriorityStyles();
    dropdownCategoryDown();
    dropdownCategoryUp();
}

/**
 * Clears the complete Add Task form.
 *
 * @returns {void}
 */
function clearTaskform() {
    resetInputErrors();
    resetTaskFields();
    resetTaskUI();
    setDefaultPriority();
}

const titleInput = document.getElementById("task-title");
const titleError = document.getElementById("titleError");
const dateDisplay = document.getElementById("dateDisplay");
const dateInput = document.getElementById("dateInput");
const dateError = document.getElementById("dateError");

dateDisplay.addEventListener("click", openDatePicker);

dateInput.addEventListener("change", () => {
    const selectedDate = new Date(dateInput.value);
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    dateDisplay.value = `${day}/${month}/${year}`;
});

/**
 * Opens the native browser date picker.
 *
 * @returns {void}
 */
function openDatePicker() {
    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {
        dateInput.click();
    }
}

/**
 * Validates the required form fields.
 *
 * @returns {boolean} True if all required fields are valid, otherwise false.
 */
function formRequired() {
    let formIsValid = true;
    if (!validateTitle()) {
        formIsValid = false;
    }
    if (!validateDate()) {
        formIsValid = false;
    }
    if (!validateCategory()) {
        formIsValid = false;
    }
    return formIsValid;
}

/**
 * Validates the task title.
 *
 * @returns {boolean} True if the title is valid, otherwise false.
 */
function validateTitle() {
    if (titleInput.value.trim() === "") {
        titleInput.classList.add("error");
        titleError.classList.add("show");
        return false;
    }
    titleInput.classList.remove("error");
    titleError.classList.remove("show");
    return true;
}

/**
 * Validates the task date.
 *
 * @returns {boolean} True if the date is valid, otherwise false.
 */
function validateDate() {
    if (dateDisplay.value.trim() === "") {
        dateDisplay.classList.add("error");
        dateError.classList.add("show");
        return false;
    }
    dateDisplay.classList.remove("error");
    dateError.classList.remove("show");
    return true;
}

function setMinDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    dateInput.min = `${year}-${month}-${day}`;
}

function validateCategory() {
    const categoryInput = document.getElementById('category-dropdown-wrapper');
    const categoryText = document.getElementById('selected_category_text');
    const categoryError = document.getElementById('categoryError');

    if (categoryText.textContent.trim() === 'Select task category') {
        categoryInput.classList.add('error');
        categoryError.classList.add('show');

        return false;
    }

    categoryInput.classList.remove('error');
    categoryError.classList.remove('show');

    return true;
}

window.dropdownCategoryDown = dropdownCategoryDown;
window.dropdownCategoryUp = dropdownCategoryUp;
window.selectedCatgeory = selectedCatgeory;
window.colorChangePriority = colorChangePriority;
window.clearTaskform = clearTaskform;
window.formRequired = formRequired;
window.createTask = createTask;

/**
 * Saves a task directly to Firebase.
 *
 * @param {Object} task - The task object to save.
 * @returns {Promise<*>} The result of the Firebase createTask function.
 */
window.addTaskToFirebase = async function (task) {
    return await createFirebaseTask(task);
};

/**
 * Returns the current Add Task state.
 *
 * @returns {{priority: string, selectedContacts: Array, subtasks: Array}}
 */
window.getAddTaskState = function () {
    return {
        priority: priority,
        selectedContacts: getSelectedContacts(),
        subtasks: window.subtasks
    };
};