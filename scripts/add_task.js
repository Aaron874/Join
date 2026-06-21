let contactsList = [
    {
        name: "ben Schneider",
        email: "ben.schneider@yahoo.de",
        phone: "+49 152 34567892",

    },
    {
        name: "Anna Müller",
        email: "anna.mueller@gmail.com",
        phone: "+49 151 23456781",
    },
    {
        name: "Clara Fischer",
        email: "clara.fischer@outlook.com",
        phone: "+49 160 45678903",
    },
    {
        name: "David Wagner",
        email: "david.wagner@mail.de",
        phone: "+49 170 56789014",
    },
    {
        name: "Emma Becker",
        email: "emma.becker@gmx.de",
        phone: "+49 171 67890125",
    },
    {
        name: "Felix Hoffmann",
        email: "felix.hoffmann@icloud.com",
        phone: "+49 172 78901236",
    },
    {
        name: "Greta Klein",
        email: "greta.klein@gmail.com",
        phone: "+49 173 89012347",
    },
    {
        name: "Hannes Wolf",
        email: "hannes.wolf@web.de",
        phone: "+49 174 90123458",
    },
    {
        name: "Isabell Neumann",
        email: "isabell.neumann@yahoo.com",
        phone: "+49 175 01234569",
    },
    {
        name: "Jonas Braun",
        email: "jonas.braun@gmx.net",
        phone: "+49 176 12345670",
    },
    {
        name: "Katharina Richter",
        email: "katharina.richter@outlook.de",
        phone: "+49 177 23456781",
    },
    {
        name: "Leon Zimmermann",
        email: "leon.zimmermann@gmail.com",
        phone: "+49 178 34567892",
    },
    {
        name: "Marie Hartmann",
        email: "marie.hartmann@icloud.de",
        phone: "+49 179 45678903",
    },
    {
        name: "Niklas Krüger",
        email: "niklas.krueger@mail.com",
        phone: "+49 180 56789014",
    },
    {
        name: "Olivia Lehmann",
        email: "olivia.lehmann@gmx.de",
        phone: "+49 181 67890125",
    },
    {
        name: "Paul König",
        email: "paul.koenig@yahoo.de",
        phone: "+49 182 78901236",
    },
    {
        name: "Quentin Schwarz",
        email: "quentin.schwarz@web.de",
        phone: "+49 183 89012347",
    },
    {
        name: "Rebecca Vogel",
        email: "rebecca.vogel@gmail.com",
        phone: "+49 184 90123458",
    },
    {
        name: "Sebastian Lang",
        email: "sebastian.lang@outlook.com",
        phone: "+49 185 01234569",
    },
    {
        name: "Theresa Roth",
        email: "theresa.roth@mail.de",
        phone: "+49 186 12345670",
    },
    {
        name: "Uwe Kaiser",
        email: "uwe.kaiser@gmx.net",
        phone: "+49 187 23456781",
    },
    {
        name: "Vanessa Frank",
        email: "vanessa.frank@yahoo.com",
        phone: "+49 188 34567892",
    },
    {
        name: "Walter Sommer",
        email: "walter.sommer@web.de",
        phone: "+49 189 45678903",
    },
    {
        name: "Xenia Albrecht",
        email: "xenia.albrecht@gmail.com",
        phone: "+49 190 56789014",
    },
    {
        name: "Yannik Busch",
        email: "yannik.busch@icloud.com",
        phone: "+49 191 67890125",
    },
    {
        name: "Zoe Peters",
        email: "zoe.peters@outlook.de",
        phone: "+49 192 78901236",
    },

    // zusätzliche gemischte Kontakte

    {
        name: "Andreas Keller",
        email: "andreas.keller@mail.de",
        phone: "+49 193 89012347",
    },
    {
        name: "Claudia Meier",
        email: "claudia.meier@gmx.de",
        phone: "+49 194 90123458",
    },
    {
        name: "Daniel Weber",
        email: "daniel.weber@yahoo.de",
        phone: "+49 195 01234569",
    },
    {
        name: "Felina Brandt",
        email: "felina.brandt@web.de",
        phone: "+49 196 12345670",
    },
    {
        name: "Hugo Sommer",
        email: "hugo.sommer@gmail.com",
        phone: "+49 197 23456781",
    },
    {
        name: "Lena Vogt",
        email: "lena.vogt@icloud.de",
        phone: "+49 198 34567892",
    },
    {
        name: "Michael Franke",
        email: "michael.franke@outlook.com",
        phone: "+49 199 45678903",
    },
    {
        name: "Sophie Krämer",
        email: "sophie.kraemer@mail.de",
        phone: "+49 200 56789014",
    },
    {
        name: "Tobias Engel",
        email: "tobias.engel@gmx.net",
        phone: "+49 201 67890125",
    },
    {
        name: "Öliver Engel",
        email: "tobias.engel@gmx.net",
        phone: "+49 201 67890125",
    },
    {
        name: "Uliver Engel",
        email: "tobias.engel@gmx.net",
        phone: "+49 201 67890125",
    }
];


let categoriesList = [
    'Technical Task',
    'User Story',
];


let priority = [

];


let tasks = [
];


const BASE_URL = "https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/";


function dropdownContactsDown() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'none';
    document.getElementById('symbole_up_dropdown_contacts').style.display = 'flex';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = 'flex';
    dropdown.innerHTML = "";
    for (let index = 0; index < contactsList.length; index++) {
        dropdown.innerHTML += contactsTemplate(contactsList[index].name);
    }
}


function dropdownContactsUp() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = '';
    document.getElementById('symbole_up_dropdown_contacts').style.display = '';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = '';
}


function dropdownCategoryDown() {
    document.getElementById('symbole_down_dropdown_category').style.display = 'none';
    document.getElementById('symbole_up_dropdown_category').style.display = 'flex';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = 'flex';
    dropdown.innerHTML = "";
    for (let index = 0; index < categoriesList.length; index++) {
        dropdown.innerHTML += categoryTemplate(categoriesList[index]);
    }
}


function dropdownCategoryUp() {
    document.getElementById('symbole_down_dropdown_category').style.display = '';
    document.getElementById('symbole_up_dropdown_category').style.display = '';
    const dropdown = document.getElementById('dropdown_category');
    dropdown.style.display = '';
}


function contactsTemplate(name) {
    return `
            <div class="contacts_div">
                <span>${name}</span>
                <input class="contacts_input" type="checkbox" />
            </div>
    `;
}


function categoryTemplate(category) {
    return `
            <div class="category_div">
                <span>${category}</span>
            </div>
    `;
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
    // const taskAssigned = 

    const task = {
        title: taskTitle,
        description: taskDescription,
        date: taskDate,
        priority: taskPriority,
        // assignedTo: taskAssigned,
        // category: taskCategory,
        subtasks: taskSubtasks,
        status: element
    };

    tasks.push(task);

    await addTaskToFirebase(task);
    priority = [];
    removeColorPriorities();
    console.log(tasks);
}


function clearTaskform() {
    const taskTitle = document.getElementById("task-title");
    const taskDescription = document.getElementById("task-description");
    const taskDate = document.getElementById("task-date");
    const taskSubtasks = document.getElementById("task-subtasks");

    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
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
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}


async function addTaskToFirebase(task={}) {
    postData('tasks', task);
}