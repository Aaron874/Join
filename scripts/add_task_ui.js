let subtasks = [];
let selectedPriority = "";
let elements = {};

const priorityConfig = {
    urgent: createPriorityConfig("urgent", "red"),
    medium: createPriorityConfig("medium", "orange"),
    low: createPriorityConfig("low", "green")
};

function createPriorityConfig(name, color) {
    return {
        button: `priority-${name}`,
        font: `${name}-font`,
        icon: `${name}-icon`,
        buttonClass: `style-priorities-${color}`,
        colorClass: `color-${name}`
    };
}

export function initAddTaskUi() {
    cacheElements();
    initDatePicker();
    initSubtaskInput();
}

function cacheElements() {
    elements = {
        title: document.getElementById("task-title"),
        titleError: document.getElementById("titleError"),
        dateDisplay: document.getElementById("dateDisplay"),
        dateInput: document.getElementById("dateInput"),
        dateError: document.getElementById("dateError")
    };
}

function initDatePicker() {
    elements.dateDisplay.addEventListener("click", openDatePicker);
    elements.dateInput.addEventListener("change", updateDisplayedDate);
}

function openDatePicker() {
    if (elements.dateInput.showPicker) {
        elements.dateInput.showPicker();
        return;
    }
    elements.dateInput.click();
}

function updateDisplayedDate() {
    const date = new Date(elements.dateInput.value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    elements.dateDisplay.value = `${day}/${month}/${date.getFullYear()}`;
}

function initSubtaskInput() {
    const input = document.getElementById("task-subtasks");
    input.addEventListener("keydown", addSubtask);
}

function addSubtask(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const title = event.target.value.trim();
    if (!title) return;
    subtasks.push({ title, completed: false });
    event.target.value = "";
    renderSubtasks();
}

function renderSubtasks() {
    const list = document.getElementById("subtasks-list");
    if (!list) return;
    list.innerHTML = subtasks.map(subtask => `<div>${subtask.title}</div>`).join("");
}

export function dropdownCategoryDown() {
    setCategoryDropdownState(true);
}

export function dropdownCategoryUp() {
    setCategoryDropdownState(false);
}

function setCategoryDropdownState(open) {
    const down = document.getElementById("symbole_down_dropdown_category");
    const up = document.getElementById("symbole_up_dropdown_category");
    const dropdown = document.getElementById("dropdown_category");
    down.style.display = open ? "none" : "flex";
    up.style.display = open ? "flex" : "";
    dropdown.style.display = open ? "flex" : "";
}

export function selectedCatgeory(element) {
    document.getElementById("selected_category_text").textContent =
        element.innerText;
    dropdownCategoryUp();
}

export function colorChangePriority(element) {
    resetPriorityStyles();
    selectedPriority = element.id.split("-")[1];
    const config = priorityConfig[selectedPriority];
    applyPriorityStyles(config);
}

function applyPriorityStyles(config) {
    const priorityElements = getPriorityElements(config);
    priorityElements.button.classList.add(config.buttonClass);
    priorityElements.font.classList.add(config.colorClass);
    priorityElements.icon.classList.add(config.colorClass);
}

function getPriorityElements(config) {
    return {
        button: document.getElementById(config.button),
        font: document.getElementById(config.font),
        icon: document.getElementById(config.icon)
    };
}

function resetPriorityStyles() {
    Object.values(priorityConfig).forEach(config => {
        const priorityElements = getPriorityElements(config);
        priorityElements.button.classList.remove(config.buttonClass);
        priorityElements.font.classList.remove(config.colorClass);
        priorityElements.icon.classList.remove(config.colorClass);
    });
}

export function validateRequiredFields() {
    const titleValid = elements.title.value.trim() !== "";
    const dateValid = elements.dateDisplay.value.trim() !== "";
    setFieldValidation(elements.title, elements.titleError, titleValid);
    setFieldValidation(elements.dateDisplay, elements.dateError, dateValid);
    return titleValid && dateValid;
}

function setFieldValidation(input, error, valid) {
    input.classList.toggle("error", !valid);
    error.classList.toggle("show", !valid);
}

export function resetAddTaskUi() {
    clearFormValues();
    selectedPriority = "";
    subtasks = [];
    resetPriorityStyles();
    dropdownCategoryUp();
    resetValidationStyles();
    renderSubtasks();
}

function clearFormValues() {
    const inputIds = [
        "task-title", "task-description", "dateDisplay", "task-subtasks"
    ];
    inputIds.forEach(id => document.getElementById(id).value = "");
    document.getElementById("selected_category_text").textContent =
        "Select task category";
}

function resetValidationStyles() {
    setFieldValidation(elements.title, elements.titleError, true);
    setFieldValidation(elements.dateDisplay, elements.dateError, true);
}

export function getSelectedPriority() {
    return selectedPriority;
}

export function getSubtasks() {
    return [...subtasks];
}

export function setAddTaskSubtasks(taskSubtasks) {
    subtasks = normalizeSubtasks(taskSubtasks);
    document.getElementById("task-subtasks").value = "";
    renderSubtasks();
}

function normalizeSubtasks(taskSubtasks) {
    if (Array.isArray(taskSubtasks)) {
        return taskSubtasks.map(subtask => ({ ...subtask }));
    }
    if (typeof taskSubtasks === "string" && taskSubtasks.trim()) {
        return [{ title: taskSubtasks.trim(), completed: false }];
    }
    return [];
}

window.setAddTaskSubtasks = setAddTaskSubtasks;
