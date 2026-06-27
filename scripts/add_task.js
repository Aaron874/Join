let contactsList = [
    "Ben Schneider",
    "Anna Müller",
    "Clara Fischer",
    "David Wagner"
];

let selectedContacts = [
];

let priority = [
];


let tasks = [
];


const BASE_URL = "https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/";


function dropdownContactsDown() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'none';
    document.getElementById('symbole_up_dropdown_contacts').style.display = 'flex';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = '';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = 'flex';
    dropdown.innerHTML = "";
    for (let index = 0; index < contactsList.length; index++) {
        dropdown.innerHTML += contactsTemplate(contactsList[index]);
    }
}


function dropdownContactsUp() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = '';
    document.getElementById('symbole_up_dropdown_contacts').style.display = '';
    let input = document.getElementById('assigned-trigger');
    input.value = '';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = 'Select contacts to assign';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = '';
    showSelectedContacts();
    selectedContacts = [];
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
    document.getElementById('symbole_down_dropdown_category').style.display = '';
    document.getElementById('symbole_up_dropdown_category').style.display = '';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = '';
}


function contactsTemplate(contactName) {
    return `
            <div class="contacts_div">
                <span>${contactName}</span>
                <input onclick="selectContact('${contactName}')" class="contacts_input" type="checkbox" />
            </div>
    `;
}


function selectContact(contactName) {
    selectedContacts.push(contactName);

    console.log(contactName);
    console.log(selectedContacts);
}

function showSelectedContacts() {
    const contactsDiv = document.getElementById('div_contacts_initials');
    contactsDiv.style.display = 'flex';
    contactsDiv.innerHTML = '';

    for (let index = 0; index < selectedContacts.length; index++) {
        contactsDiv.innerHTML += templateSelectedContacts(selectedContacts[index]);
    }
}

function templateSelectedContacts(selectedContact) {
    return `<div>
        <span>${selectedContact}</span>
    </div>
    `;
}


function selectedCatgeory(element) {
    document.getElementById("selected_category_text").textContent =
        element.innerText;
    dropdownCategoryUp();
}


function colorChangePriority(element) {
    const urgent = document.getElementById('priority-urgent');
    const urgentFont = document.getElementById('urgent-font');
    const urgentIcon = document.getElementById('urgent-icon');
    const medium = document.getElementById('priority-medium');
    const mediumFont = document.getElementById('medium-font');
    const mediumIcon = document.getElementById('medium-icon');
    const low = document.getElementById('priority-low');
    const lowFont = document.getElementById('low-font');
    const lowIcon = document.getElementById('low-icon');
    if (element === urgent) {
        element.classList.add("style-priorities-red");
        urgentFont.classList.add("color-urgent");
        urgentIcon.classList.add("color-urgent");
        medium.classList.remove("style-priorities-orange")
        mediumFont.classList.remove("color-medium")
        mediumIcon.classList.remove("color-medium")
        low.classList.remove("style-priorities-green")
        lowFont.classList.remove("color-low")
        lowIcon.classList.remove("color-low")
    } else if (element === medium) {
        element.classList.add("style-priorities-orange");
        mediumFont.classList.add("color-medium");
        mediumIcon.classList.add("color-medium");
        urgent.classList.remove("style-priorities-red")
        urgentFont.classList.remove("color-urgent")
        urgentIcon.classList.remove("color-urgent")
        low.classList.remove("style-priorities-green")
        lowFont.classList.remove("color-low")
        lowIcon.classList.remove("color-low")
    } else {
        element.classList.add("style-priorities-green");
        lowFont.classList.add("color-low");
        lowIcon.classList.add("color-low");
        urgent.classList.remove("style-priorities-red")
        urgentFont.classList.remove("color-urgent")
        urgentIcon.classList.remove("color-urgent")
        medium.classList.remove("style-priorities-orange")
        mediumFont.classList.remove("color-medium")
        mediumIcon.classList.remove("color-low")
    }
    const priorities = element.id.split("-")[1];

    priority.push(priorities);
}


async function createTask(element) {
    const taskTitle = document.getElementById("task-title").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskDate = document.getElementById("task-date").value;
    const taskSubtasks = document.getElementById("task-subtasks").value;
    const taskPriority = priority[0];
    const taskCategory = document.getElementById('selected_category_text').textContent;
    const taskAssigned = document.getElementById('div_contacts_initials').textContent;

    const task = {
        title: taskTitle,
        description: taskDescription,
        date: taskDate,
        priority: taskPriority,
        assignedTo: taskAssigned,
        category: taskCategory,
        subtasks: taskSubtasks,
        status: element
    };

    tasks.push(task);

    await addTaskToFirebase(task);
    priority = [];
    clearTaskform();
    console.log(tasks);
}


function clearTaskform() {
    const taskTitle = document.getElementById("task-title");
    const taskDescription = document.getElementById("task-description");
    const taskDate = document.getElementById("task-date");
    const taskSubtasks = document.getElementById("task-subtasks");
    const taskCategory = document.getElementById('selected_category_text');
    const taskAssigned = document.getElementById('div_contacts_initials');
    let input = document.getElementById('assigned-trigger');
    input.value = '';
    let inputPlaceholder = document.getElementById('selected_contacts');
    inputPlaceholder.textContent = 'Select contacts to assign';

    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    taskCategory.textContent = "Select Task Category";
    taskAssigned.style.display = "";
    taskSubtasks.value = "";

    removeColorPriorities();
}

function removeColorPriorities() {
    document.getElementById('priority-urgent').classList.remove("style-priorities-red")
    document.getElementById('urgent-font').classList.remove("color-urgent")
    document.getElementById('urgent-icon').classList.remove("color-urgent")
    document.getElementById('priority-medium').classList.remove("style-priorities-orange")
    document.getElementById('medium-font').classList.remove("color-medium")
    document.getElementById('medium-icon').classList.remove("color-low")
    document.getElementById('priority-low').classList.remove("style-priorities-green")
    document.getElementById('low-font').classList.remove("color-low")
    document.getElementById('low-icon').classList.remove("color-low")
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
}