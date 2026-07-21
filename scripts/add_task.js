let selectedContacts = [];


let searchedContactsArray = [];


let priority = [];


let tasks = [];

let subtasks = [];


const BASE_URL = "https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/";


const priorityConfig = {
    urgent: {
        button: 'priority-urgent',
        font: 'urgent-font',
        icon: 'urgent-icon',
        buttonClass: 'style-priorities-red',
        colorClass: 'color-urgent'
    },
    medium: {
        button: 'priority-medium',
        font: 'medium-font',
        icon: 'medium-icon',
        buttonClass: 'style-priorities-orange',
        colorClass: 'color-medium'
    },
    low: {
        button: 'priority-low',
        font: 'low-font',
        icon: 'low-icon',
        buttonClass: 'style-priorities-green',
        colorClass: 'color-low'
    }
};


window.addEventListener('DOMContentLoaded', initAddTask);

function initAddTask() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'flex';
    document.getElementById('symbole_down_dropdown_category').style.display = 'flex';
}


function searchContacts() {
    const searchedContacts = document.getElementById('dropdown_contacts');
    const input = document.getElementById('assigned-trigger').value.toLowerCase().trim();
    searchedContacts.innerHTML = '';
    if (input.length < 3) {
        searchedContacts.style.display = 'none';
        return;
    }
    const results = contactsList.filter(contact => contact.name.toLowerCase().includes(input));
    searchedContacts.style.display = 'flex';
    for (let index = 0; index < results.length; index++) {
        let shortName = contactListInitials(results[index].name);
        let searchedContactName = results[index].name[0].toUpperCase() + results[index].name.slice(1);
        searchedContacts.innerHTML += contactsTemplate(searchedContactName, results[index].color, shortName);
    }
}


function dropdownContactsDown() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'none';
    document.getElementById('symbole_up_dropdown_contacts').style.display = 'flex';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = '';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = 'flex';
    dropdown.innerHTML = "";
    for (let index = 0; index < contactsList.length; index++) {
        let shortName = contactListInitials(contactsList[index].name);
        let person = contactsList[index].name[0].toUpperCase() + contactsList[index].name.slice(1);
        let color = contactsList[index].color;
        dropdown.innerHTML += contactsTemplate(person, color, shortName);
    }
}


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


function clearInput() {
    let input = document.getElementById('assigned-trigger');
    input.value = '';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = '';
}


function dropdownCategoryDown() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'none';
    document.getElementById('symbole_up_dropdown_category').style.display = 'flex';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = 'flex';
}


function dropdownCategoryUp() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'flex';
    document.getElementById('symbole_up_dropdown_category').style.display = '';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = '';
}

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


function toggleContact(contactName, shortName, color) {
    const contactExists = selectedContacts.some(
        contact => contact.name === contactName);
    if (contactExists) {
        selectedContacts = selectedContacts.filter(
            contact => contact.name !== contactName);
        showSelectedContacts();
        return;
    }
    selectedContacts.push({
        name: contactName,
        shortName: shortName,
        color: color
    });
    showSelectedContacts();
}


function showSelectedContacts() {
    const contactsDiv = document.getElementById('div_contacts_initials');
    contactsDiv.style.display = 'flex';
    contactsDiv.innerHTML = '';

    for (let index = 0; index < selectedContacts.length; index++) {
        contactsDiv.innerHTML += templateSelectedContacts(selectedContacts[index].shortName, selectedContacts[index].color);

    }
}

function templateSelectedContacts(shortName, color) {

    return `<div>
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
            </div>`;
}


function selectedCatgeory(element) {
    document.getElementById("selected_category_text").textContent =
        element.innerText;
    dropdownCategoryUp();
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
        const elements = getPriorityElements(config);
        elements.button.classList.remove(config.buttonClass);
        elements.font.classList.remove(config.colorClass);
        elements.icon.classList.remove(config.colorClass);
    });
}

function colorChangePriority(element) {
    resetPriorityStyles();

    const priorityName = element.id.split("-")[1];
    const config = priorityConfig[priorityName];
    const elements = getPriorityElements(config);

    elements.button.classList.add(config.buttonClass);
    elements.font.classList.add(config.colorClass);
    elements.icon.classList.add(config.colorClass);

    priority.push(priorityName);
}

document.getElementById('task-subtasks').addEventListener('keydown', addSubtask);

function addSubtask(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = event.target;
    const title = input.value.trim();
    if (!title) return;
    subtasks.push({
        title,
        completed: false
    });
    input.value = '';
    renderSubtasks();
}

function getTaskData(element) {
    return {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("task-description").value.trim(),
        date: document.getElementById("dateDisplay").value.trim(),
        subtasks: [...subtasks],
        priority: priority[0],
        assignedTo: selectedContacts.map(c => c.name).join(", "),
        category: document.getElementById("selected_category_text").textContent.trim(),
        status: element
    };
}


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


async function createTask(element) {
    formRequired();
    const task = getTaskData(element);

    if (!isTaskValid(task)) return;

    tasks.push(task);
    await addTaskToFirebase(task);
    priority = [];
    selectedContacts = [];
    clearTaskform();
    console.log(tasks);
}


function resetInputErrors() {
    titleInput.classList.remove("error");
    titleError.classList.remove("show");
    dateDisplay.classList.remove("error");
    dateError.classList.remove("show");
}


function resetTaskFields() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("dateDisplay").value = "";
    document.getElementById("task-subtasks").value = "";
    document.getElementById("assigned-trigger").value = "";
    document.getElementById("selected_contacts").textContent = "Select contacts to assign";
    document.getElementById("selected_category_text").textContent = "Select task category";
    document.getElementById("div_contacts_initials").style.display = "";
    subtasks = [];
    renderSubtasks();
}


function resetTaskUI() {
    selectedContacts = [];
    resetPriorityStyles();
    dropdownCategoryDown();
    dropdownCategoryUp();
}


function clearTaskform() {
    resetInputErrors();
    resetTaskFields();
    resetTaskUI();
}


async function postData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}


async function addTaskToFirebase(task = {}) {
    postData('tasks', task);
    await reloadBoard();
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

function openDatePicker() {
    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {
        dateInput.click();
    }
}


function formRequired() {
    let formIsValid = true;
    if (titleInput.value.trim() === "") {
        titleInput.classList.add("error");
        titleError.classList.add("show");
        formIsValid = false;
    } else {
        titleInput.classList.remove("error");
    }
    if (dateDisplay.value.trim() === "") {
        dateDisplay.classList.add("error");
        dateError.classList.add("show");
        formIsValid = false;
    } else {
        dateDisplay.classList.remove("error");
    }
    if (!formIsValid) return;
}