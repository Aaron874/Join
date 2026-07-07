let selectedContacts = [
];


let searchedContactsArray = [];


let priority = [
];


let tasks = [
];


document.getElementById('symbole_down_dropdown_contacts').style.display = 'flex';
document.getElementById('symbole_down_dropdown_category').style.display = 'flex';


const BASE_URL = "https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/";


// function searchContacts() {
//     searchedContactsArray = [];
//     const searchedContacts = document.getElementById('dropdown_contacts');
//     searchedContacts.style.display = "flex";
//     searchedContacts.innerHTML = '';
//     let input = document.getElementById('input_field').value.toLowerCase();
//     let results = contactsList.filter(name =>
//         name.toLowerCase().includes(input));

//         for (let index = 0; index < results.length; index++) {
//             const element = array[index];

//         }
// }


function searchContacts() {
    const searchedContacts = document.getElementById('dropdown_contacts');
    const input = document.getElementById('assigned-trigger').value.toLowerCase().trim();
    searchedContacts.innerHTML = '';
    if (input.length < 3) {
        searchedContacts.style.display = 'none';
        return;
    }
    const results = contactsList.filter(contact =>
        contact.name.toLowerCase().includes(input)
    );
    searchedContacts.style.display = 'flex';

    for (let index = 0; index < results.length; index++) {
        let shortName = contactListInitials(results[index].name);
        let searchedContactName = results[index].name[0].toUpperCase() +
            results[index].name.slice(1);
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
        let person = contactsList[index].name[0].toUpperCase() +
            contactsList[index].name.slice(1);
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
    const checked = selectedContacts.some(
        contact => contact.name.trim() === contactName.trim()
    );
    return `
        <div class="contacts_div">
            <div class="contacts_dropdown_initials-plus-name_style">
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
                <span>${contactName}</span>
            </div>
            <input
                class="contacts_input"
                type="checkbox"
                ${checked ? 'checked' : ''}
                onchange="toggleContact('${contactName}', '${shortName}', '${color}')"
            />
        </div>
    `;
}


function toggleContact(contactName, shortName, color) {
    const contactExists = selectedContacts.some(
        contact => contact.name === contactName
    );

    if (contactExists) {
        selectedContacts = selectedContacts.filter(
            contact => contact.name !== contactName
        );

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


// async function createTask(element) {
//     const taskTitle = document.getElementById("task-title").value;
//     const taskDescription = document.getElementById("task-description").value;
//     const taskDate = document.getElementById("task-date").value;
//     const taskSubtasks = document.getElementById("task-subtasks").value;
//     const taskPriority = priority[0];
//     const taskCategory = document.getElementById('selected_category_text').textContent;
//     const taskAssigned = selectedContacts
//         .map(contact => contact.name)
//         .join(", ");

//     const task = {
//         title: taskTitle,
//         description: taskDescription,
//         date: taskDate,
//         priority: taskPriority,
//         assignedTo: taskAssigned,
//         category: taskCategory,
//         subtasks: taskSubtasks,
//         status: element
//     };

//     if (taskTitle > 0 || taskDescription > 0 || taskSubtasks > 0 || taskCategory > 0) {
//         tasks.push(task);

//         await addTaskToFirebase(task);
//         priority = [];
//         selectedContacts = [];
//         clearTaskform();
//         console.log(tasks);
//     }
// }



async function createTask(element) {
    const taskTitle = document.getElementById("task-title").value.trim();
    const taskDescription = document.getElementById("task-description").value.trim();
    const taskDate = document.getElementById("task-date").value.trim();
    const taskSubtasks = document.getElementById("task-subtasks").value.trim();
    const taskPriority = priority[0];
    const taskCategory = document.getElementById('selected_category_text').textContent.trim();
    const taskAssigned = selectedContacts
        .map(contact => contact.name)
        .join(", ");

    if (
        taskTitle.length > 0 &&
        taskDescription.length > 0 &&
        taskDate.length > 0 &&
        taskSubtasks.length > 0 &&
        taskPriority.length > 0 &&
        taskCategory.length > 0 &&
        taskCategory !== "Select task category" &&
        selectedContacts.length > 0
    ) {
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
        selectedContacts = [];
        clearTaskform();
        console.log(tasks);
    }
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

    selectedContacts = [];
    removeColorPriorities();
    dropdownCategoryDown();
    dropdownCategoryUp();
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