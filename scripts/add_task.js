import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { getContacts, getAllContacts } from "../firebase/contacts.service.js";
import { createTask as createFirebaseTask } from "../firebase/task.service.js";
let selectedContacts = [];
let priority = "";
let contactsList = [];

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

document.addEventListener('click', event => {
    if (!event.target.closest('#contacts-dropdown-wrapper'))
        dropdownContactsUp();

    if (!event.target.closest('#category-dropdown-wrapper'))
        dropdownCategoryUp();
});

/**
 * Initialize the add task page when the DOM is ready.
 *
 * @returns {Promise<void>} Resolves when authentication and contact retrieval complete.
 */
async function initAddTask() {
    try {
        await ensureAuthenticatedUser();
        contactsList = await getAllContacts();
        showDropdownArrows();
    } catch (error) {
        console.error("Add Task konnte nicht initialisiert werden:", error);
    }
}

/**
 * Display the dropdown arrow icons for contact and category dropdowns.
 */
function showDropdownArrows() {
    document.getElementById("symbole_down_dropdown_contacts").style.display = "flex";
    document.getElementById("symbole_down_dropdown_category").style.display = "flex";
}

/**
 * Wait for an authenticated user session before initializing task creation.
 *
 * @returns {Promise<any>} The authenticated user session result.
 */
async function ensureAuthenticatedUser() {
    return waitForAuthenticatedUser();
}

/**
 * Filter contacts by the current search input and render the results.
 */
function searchContacts() {
    const searchedContacts = document.getElementById('dropdown_contacts');
    const input = document.getElementById('assigned-trigger').value.toLowerCase().trim();
    searchedContacts.innerHTML = '';
    if (input.length < 3) {
        searchedContacts.style.display = 'none';
        return;
    }
    const results = contactsList.filter(contact => contact.name.toLowerCase().includes(input));
    renderSearchedContacts(searchedContacts, results);
}

/**
 * Render the list of contacts matching the search query.
 *
 * @param {HTMLElement} searchedContacts - Container element for search results.
 * @param {Array<Object>} results - Filtered contacts to render.
 */
function renderSearchedContacts(searchedContacts, results) {
    searchedContacts.style.display = 'flex';
    for (let index = 0; index < results.length; index++) {
        let shortName = contactListInitials(results[index].name);
        let searchedContactName =
            results[index].name[0].toUpperCase() + results[index].name.slice(1);
        searchedContacts.innerHTML +=
            contactsTemplate(searchedContactName, results[index].color, shortName);
    }
}

/**
 * Compute initials from a contact name.
 *
 * @param {string} contactName - The full contact name.
 * @returns {string} Initials derived from the name.
 */
function contactListInitials(contactName) {
    return contactName.trim().split(/\s+/).slice(0, 2)
        .map(word => word[0].toUpperCase()).join('');
}

/**
 * Open the contacts dropdown and render the available contacts.
 */
function dropdownContactsDown() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'none';
    document.getElementById('symbole_up_dropdown_contacts').style.display = 'flex';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = '';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = 'flex';
    renderContacts(dropdown);
}

/**
 * Render all contacts inside the contacts dropdown container.
 *
 * @param {HTMLElement} dropdown - The dropdown element to populate.
 */
function renderContacts(dropdown) {
    dropdown.innerHTML = '';
    for (let index = 0; index < contactsList.length; index++) {
        let shortName = contactListInitials(contactsList[index].name);
        let person = contactsList[index].name[0].toUpperCase() + contactsList[index].name.slice(1);
        let color = contactsList[index].color;
        dropdown.innerHTML += contactsTemplate(person, color, shortName);
    }
}

/**
 * Close the contacts dropdown and restore the selected contacts display.
 */
function dropdownContactsUp() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'flex';
    document.getElementById('symbole_up_dropdown_contacts').style.display = '';
    let input = document.getElementById('assigned-trigger');
    input.value = '';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = 'Select contacts to assign';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = '';
    showSelectedContacts();
}

/**
 * Clear the assigned contacts search input and placeholder text.
 */
function clearInput() {
    let input = document.getElementById('assigned-trigger');
    input.value = '';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = '';
}

/**
 * Open the category dropdown menu.
 */
function dropdownCategoryDown() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'none';
    document.getElementById('symbole_up_dropdown_category').style.display = 'flex';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = 'flex';
}

/**
 * Close the category dropdown menu.
 */
function dropdownCategoryUp() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'flex';
    document.getElementById('symbole_up_dropdown_category').style.display = '';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = '';
}

/**
 * Build a contact entry for the assignment dropdown.
 *
 * @param {string} contactName - The display name of the contact.
 * @param {string} color - The contact badge color.
 * @param {string} shortName - The contact initials.
 * @returns {string} HTML string for a contact dropdown item.
 */
function contactsTemplate(contactName, color, shortName) {
    const checked = selectedContacts.some(contact => contact.name.trim() === contactName.trim());
    return `
        <div class="contacts_div">
            <div class="contacts_dropdown_initials-plus-name_style">
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
                <span>${contactName}</span>
            </div>
            <input class="contacts_input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleContact('${contactName}', '${shortName}', '${color}')"/>
        </div>`;
}

/**
 * Toggle selection of a contact for the current task.
 *
 * @param {string} contactName - The name of the contact to toggle.
 * @param {string} shortName - The contact initials.
 * @param {string} color - The contact badge color.
 */
function toggleContact(contactName, shortName, color) {
    const contactExists = selectedContacts.some(contact => contact.name === contactName);
    if (contactExists) {
        removeSelectedContact(contactName);
        return;
    }
    selectedContacts.push({
        name: contactName,
        shortName: shortName,
        color: color
    });
    showSelectedContacts();
}

/**
 * Remove a contact from the selected contacts list.
 *
 * @param {string} contactName - The name of the contact to remove.
 */
function removeSelectedContact(contactName) {
    selectedContacts = selectedContacts.filter(contact => contact.name !== contactName);
    showSelectedContacts();
}

/**
 * Display the currently selected contacts in the task form.
 */
function showSelectedContacts() {
    const contactsDiv = document.getElementById('div_contacts_initials');
    contactsDiv.style.display = 'flex';
    contactsDiv.innerHTML = '';
    for (let index = 0; index < selectedContacts.length; index++) {
        contactsDiv.innerHTML += templateSelectedContacts(selectedContacts[index].shortName, selectedContacts[index].color);
    }
}

/**
 * Render the selected contact initials badge.
 *
 * @param {string} shortName - The contact initials.
 * @param {string} color - The contact badge color.
 * @returns {string} HTML string for the selected contact badge.
 */
function templateSelectedContacts(shortName, color) {
    return `<div>
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
            </div>`;
}

/**
 * Set the selected category label and close the category dropdown.
 *
 * @param {HTMLElement} element - The selected category element.
 */
function selectedCatgeory(element) {
    document.getElementById("selected_category_text").textContent = element.innerText;
    dropdownCategoryUp();
}

/**
 * Retrieve the DOM elements used for a priority option.
 *
 * @param {Object} config - The priority configuration object.
 * @returns {{button:HTMLElement,font:HTMLElement,icon:HTMLElement}} The priority elements.
 */
function getPriorityElements(config) {
    return {
        button: document.getElementById(config.button),
        font: document.getElementById(config.font),
        icon: document.getElementById(config.icon)
    };
}

/**
 * Reset all priority styling classes to their default state.
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
 * Apply the selected priority styling and update the current priority.
 *
 * @param {HTMLElement} element - The clicked priority button element.
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
 * Collect all task data from the add task form.
 *
 * @param {string} element - The desired status for the new task.
 * @returns {Object} The assembled task object.
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
 * Get the currently assigned contacts for the task.
 *
 * @returns {Array<Object>} Array of selected contact objects.
 */
function getAssignedContacts() {
    return selectedContacts.map(contact => ({
        name: contact.name, shortName: contact.shortName, color: contact.color
    }));
}

/**
 * Validate that the current task form data is sufficient to create a task.
 *
 * @param {Object} task - The assembled task data.
 * @returns {boolean} True if the task is valid, false otherwise.
 */
function isTaskValid(task) {
    return task.title &&
        task.description &&
        task.date &&
        task.subtasks &&
        task.priority &&
        task.category !== "Select task category" &&
        task.category &&
        selectedContacts.length > 0;
}

/**
 * Create a new task after validating the form and saving to Firebase.
 *
 * @param {string} element - The desired status for the new task.
 * @returns {Promise<void>} Resolves when task creation completes.
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
 * Reset the form and UI after successful task creation.
 */
function taskCreatedSuccessfully() {
    priority = "";
    selectedContacts = [];
    clearTaskform();
    taskSuccessfullyCreatedDialog();
}

/**
 * Remove validation error styling from title and date fields.
 */
function resetInputErrors() {
    titleInput.classList.remove("error");
    titleError.classList.remove("show");
    dateDisplay.classList.remove("error");
    dateError.classList.remove("show");
}

/**
 * Reset all visible task form input fields to their default state.
 */
function resetTaskFields() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("dateDisplay").value = "";
    document.getElementById("task-subtasks").value = "";
    document.getElementById("assigned-trigger").value = "";
    document.getElementById("selected_contacts").textContent = "Select contacts to assign";
    document.getElementById("selected_category_text").textContent = "Select task category";
    document.getElementById("div_contacts_initials").style.display = "";
    window.resetSubtasks();
}

/**
 * Reset the add task UI state and hide active dropdowns.
 */
function resetTaskUI() {
    selectedContacts = [];
    resetPriorityStyles();
    dropdownContactsUp();
    dropdownCategoryDown();
    dropdownCategoryUp();
}

/**
 * Clear the add task form and reset all related UI state.
 */
function clearTaskform() {
    resetInputErrors();
    resetTaskFields();
    resetTaskUI();
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
 * Open the browser date picker for the task date input.
 */
function openDatePicker() {
    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {
        dateInput.click();
    }
}

/**
 * Validate required form fields and return whether the form is valid.
 *
 * @returns {boolean} True if required fields are valid, false otherwise.
 */
function formRequired() {
    let formIsValid = true;
    if (!validateTitle()) {
        formIsValid = false;
    }
    if (!validateDate()) {
        formIsValid = false;
    }
    return formIsValid;
}

/**
 * Validate the task title input and show error styling if invalid.
 *
 * @returns {boolean} True when the title is valid, false otherwise.
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
 * Validate the task date display input and show error styling if invalid.
 *
 * @returns {boolean} True when the date is valid, false otherwise.
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

window.searchContacts = searchContacts;
window.clearInput = clearInput;
window.dropdownContactsDown = dropdownContactsDown;
window.dropdownContactsUp = dropdownContactsUp;
window.dropdownCategoryDown = dropdownCategoryDown;
window.dropdownCategoryUp = dropdownCategoryUp;
window.selectedCatgeory = selectedCatgeory;
window.colorChangePriority = colorChangePriority;
window.clearTaskform = clearTaskform;
window.toggleContact = toggleContact;
window.showSelectedContacts = showSelectedContacts;
window.formRequired = formRequired;
window.createTask = createTask;
window.addTaskToFirebase = async function (task) { return await createFirebaseTask(task); };

window.getAddTaskState = function () {
    return { priority: priority, selectedContacts, subtasks: window.subtasks };
};

window.setSelectedContacts = function (contacts) {
    selectedContacts = Array.isArray(contacts) ? contacts.map(contact => ({ ...contact })) : [];
    showSelectedContacts();
};