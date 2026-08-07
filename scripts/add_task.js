import { waitForAuthenticatedUser } from "../firebase/auth-state.js";
import { getContacts } from "../firebase/contacts.service.js";
import { createTask as createFirebaseTask } from "../firebase/task.service.js";
import {
    initContactDropdown,
    searchContacts,
    dropdownContactsDown,
    dropdownContactsUp,
    clearInput,
    toggleContact,
    getSelectedContacts,
    resetContacts,
    showSelectedContacts,
    setContacts
} from "./add_task_contacts.js";
import {
    initAddTaskUi,
    dropdownCategoryDown,
    dropdownCategoryUp,
    selectedCatgeory,
    colorChangePriority,
    getSelectedPriority,
    getSubtasks,
    resetAddTaskUi,
    validateRequiredFields
} from "./add_task_ui.js";

const tasks = [];
let contactsList = [];

window.addEventListener("DOMContentLoaded", initAddTask);

async function initAddTask() {
    try {
        initAddTaskUi();
        initContactDropdown();
        await waitForAuthenticatedUser();
        contactsList = await getContacts();
        setContacts(contactsList);
        showInitialDropdownIcons();
    } catch (error) {
        console.error("Add Task konnte nicht initialisiert werden:", error);
    }
}

document.addEventListener('click', event => {
    if (!event.target.closest('#contacts-dropdown-wrapper'))
        dropdownContactsUp();
    if (!event.target.closest('#category-dropdown-wrapper'))
        dropdownCategoryUp();
});

function showInitialDropdownIcons() {
    document.getElementById("symbole_down_dropdown_contacts").style.display = "flex";
    document.getElementById("symbole_down_dropdown_category").style.display = "flex";
}

function getTaskData(status) {
    const selectedContacts = getSelectedContacts();
    return {
        title: getValue("task-title"),
        description: getValue("task-description"),
        date: getValue("dateDisplay"),
        subtasks: getSubtasks(),
        priority: getSelectedPriority(),
        assignedTo: selectedContacts.map(contact => contact.name).join(", "),
        category: getCategory(),
        status
    };
}

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function getCategory() {
    return document.getElementById("selected_category_text").textContent.trim();
}

function isTaskValid(task) {
    return Boolean(
        task.title &&
        task.description &&
        task.date &&
        task.priority &&
        task.category &&
        task.category !== "Select task category" &&
        getSelectedContacts().length
    );
}

async function createTask(status) {
    validateRequiredFields();
    const task = getTaskData(status);
    if (!isTaskValid(task)) return;
    try {
        await saveTask(task);
        clearTaskform();
        taskSuccessfullyCreatedDialog();
    } catch (error) {
        console.error("Task konnte nicht gespeichert werden:", error);
    }
}

async function saveTask(task) {
    const result = await createFirebaseTask(task);
    tasks.push({ id: result.key, ...task });
}

function taskSuccessfullyCreatedDialog() {
    alert("Task successfully created");
}

function clearTaskform() {
    resetContacts();
    resetAddTaskUi();
}

function getAddTaskState() {
    return {
        priority: getSelectedPriority(),
        selectedContacts: getSelectedContacts(),
        subtasks: getSubtasks()
    };
}

function exposeFunctions() {
    Object.assign(window, {
        searchContacts,
        clearInput,
        dropdownContactsDown,
        dropdownContactsUp,
        dropdownCategoryDown,
        dropdownCategoryUp,
        selectedCatgeory,
        colorChangePriority,
        clearTaskform,
        toggleContact,
        showSelectedContacts,
        createTask,
        getAddTaskState
    });
}

exposeFunctions();
window.addTaskToFirebase = async function (task) {
    return await createFirebaseTask(task);
};

