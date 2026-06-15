// Beispiel Kontakte für Testzwecke //
const contactsListContainer = document.querySelector(
  ".contacts_list_container"
);
const contactsSingleViewContainer = document.querySelector(
  "#contacts_single_view_content_id"
);
const addContactDialog = document.getElementById("add_contact_dialog_id");
const editContactDialog = document.getElementById("edit_contact_dialog_id");
const editContactInputContainer = document.getElementById("edit_contact_form_section_id");
const form = document.getElementById("add_contact_form_id");
form.addEventListener("submit", addNewContact);
let firstLetterList = [];
let contactsList = [
  {
    name: "ben Schneider",
    email: "ben.schneider@yahoo.de",
    phone: "+49 152 34567892",
    color: "#FF6B6B",
  },
  {
    name: "Anna Müller",
    email: "anna.mueller@gmail.com",
    phone: "+49 151 23456781",
    color: "#4ECDC4",
  },
  {
    name: "Clara Fischer",
    email: "clara.fischer@outlook.com",
    phone: "+49 160 45678903",
    color: "#45B7D1",
  },
  {
    name: "David Wagner",
    email: "david.wagner@mail.de",
    phone: "+49 170 56789014",
    color: "#F7B267",
  },
  {
    name: "Emma Becker",
    email: "emma.becker@gmx.de",
    phone: "+49 171 67890125",
    color: "#A78BFA",
  },
  {
    name: "Felix Hoffmann",
    email: "felix.hoffmann@icloud.com",
    phone: "+49 172 78901236",
    color: "#34D399",
  },
  {
    name: "Greta Klein",
    email: "greta.klein@gmail.com",
    phone: "+49 173 89012347",
    color: "#F472B6",
  },
  {
    name: "Hannes Wolf",
    email: "hannes.wolf@web.de",
    phone: "+49 174 90123458",
    color: "#60A5FA",
  },
  {
    name: "Isabell Neumann",
    email: "isabell.neumann@yahoo.com",
    phone: "+49 175 01234569",
    color: "#F97316",
  },
  {
    name: "Jonas Braun",
    email: "jonas.braun@gmx.net",
    phone: "+49 176 12345670",
    color: "#2DD4BF",
  },
  {
    name: "Katharina Richter",
    email: "katharina.richter@outlook.de",
    phone: "+49 177 23456781",
    color: "#818CF8",
  },
  {
    name: "Leon Zimmermann",
    email: "leon.zimmermann@gmail.com",
    phone: "+49 178 34567892",
    color: "#FB7185",
  },
  {
    name: "Marie Hartmann",
    email: "marie.hartmann@icloud.de",
    phone: "+49 179 45678903",
    color: "#38BDF8",
  },
  {
    name: "Niklas Krüger",
    email: "niklas.krueger@mail.com",
    phone: "+49 180 56789014",
    color: "#FACC15",
  },
  {
    name: "Olivia Lehmann",
    email: "olivia.lehmann@gmx.de",
    phone: "+49 181 67890125",
    color: "#C084FC",
  },
  {
    name: "Paul König",
    email: "paul.koenig@yahoo.de",
    phone: "+49 182 78901236",
    color: "#22C55E",
  },
  {
    name: "Quentin Schwarz",
    email: "quentin.schwarz@web.de",
    phone: "+49 183 89012347",
    color: "#E879F9",
  },
  {
    name: "Rebecca Vogel",
    email: "rebecca.vogel@gmail.com",
    phone: "+49 184 90123458",
    color: "#06B6D4",
  },
  {
    name: "Sebastian Lang",
    email: "sebastian.lang@outlook.com",
    phone: "+49 185 01234569",
    color: "#F59E0B",
  },
  {
    name: "Theresa Roth",
    email: "theresa.roth@mail.de",
    phone: "+49 186 12345670",
    color: "#8B5CF6",
  },
  {
    name: "Uwe Kaiser",
    email: "uwe.kaiser@gmx.net",
    phone: "+49 187 23456781",
    color: "#10B981",
  },
  {
    name: "Vanessa Frank",
    email: "vanessa.frank@yahoo.com",
    phone: "+49 188 34567892",
    color: "#EC4899",
  },
  {
    name: "Walter Sommer",
    email: "walter.sommer@web.de",
    phone: "+49 189 45678903",
    color: "#3B82F6",
  },
  {
    name: "Xenia Albrecht",
    email: "xenia.albrecht@gmail.com",
    phone: "+49 190 56789014",
    color: "#F97316",
  },
  {
    name: "Yannik Busch",
    email: "yannik.busch@icloud.com",
    phone: "+49 191 67890125",
    color: "#14B8A6",
  },
  {
    name: "Zoe Peters",
    email: "zoe.peters@outlook.de",
    phone: "+49 192 78901236",
    color: "#6366F1",
  },
  {
    name: "Andreas Keller",
    email: "andreas.keller@mail.de",
    phone: "+49 193 89012347",
    color: "#EF4444",
  },
  {
    name: "Claudia Meier",
    email: "claudia.meier@gmx.de",
    phone: "+49 194 90123458",
    color: "#0EA5E9",
  },
  {
    name: "Daniel Weber",
    email: "daniel.weber@yahoo.de",
    phone: "+49 195 01234569",
    color: "#84CC16",
  },
  {
    name: "Felina Brandt",
    email: "felina.brandt@web.de",
    phone: "+49 196 12345670",
    color: "#D946EF",
  },
  {
    name: "Hugo Sommer",
    email: "hugo.sommer@gmail.com",
    phone: "+49 197 23456781",
    color: "#06B6D4",
  },
  {
    name: "Lena Vogt",
    email: "lena.vogt@icloud.de",
    phone: "+49 198 34567892",
    color: "#F43F5E",
  },
  {
    name: "Michael Franke",
    email: "michael.franke@outlook.com",
    phone: "+49 199 45678903",
    color: "#8B5CF6",
  },
  {
    name: "Sophie Krämer",
    email: "sophie.kraemer@mail.de",
    phone: "+49 200 56789014",
    color: "#0F766E",
  },
  {
    name: "Tobias Engel",
    email: "tobias.engel@gmx.net",
    phone: "+49 201 67890125",
    color: "#F59E0B",
  },
  {
    name: "Öliver Engel",
    email: "tobias.engel@gmx.net",
    phone: "+49 201 67890125",
    color: "#7C3AED",
  },
  {
    name: "Uliver Engel",
    email: "tobias.engel@gmx.net",
    phone: "+49 201 67890125",
    color: "#059669",
  },
];

function letterSeperatorContactsList() {
  for (let index = 0; index < contactsList.length; index++) {
    if (/^[a-zA-ZäöüÄÖÜß]$/.test(contactsList[index].name[0])) {
      let firstLetter = contactsList[index].name[0].toUpperCase();
      firstLetterList.push(firstLetter);
    }
  }
  sortContactsList();
}

function sortContactsList() {
  firstLetterList = [...new Set(firstLetterList)];
  firstLetterList.sort((a, b) => a.localeCompare(b, "de"));
  createContactsList();
}

function createContactsList() {
  for (let index = 0; index < firstLetterList.length; index++) {
    contactsListContainer.innerHTML += renderContactsList(
      firstLetterList[index]
    );
  }
  createContactListItems();
}

// Funktion zum Rendern von Personen -- shortName, Person, Email
function createContactListItems() {
  for (let index = 0; index < contactsList.length; index++) {
    let shortName = contactListInitials(contactsList[index].name);
    let person = contactsList[index].name;
    let phone = contactsList[index].phone;
    let email = contactsList[index].email;
    let firstLetter = contactsList[index].name[0].toUpperCase();
    let color = contactsList[index].color;
    let targetElement = document.querySelector(
      `[data-letter="${firstLetter}"]`
    );
    targetElement.after(
      renderContactsListItems(shortName, person, email, color, phone)
    );
  }
}

function contactListInitials(contactListName) {
  let initials = contactListName
    .split(" ")
    .splice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials;
}

function openSingleViewContact(shortName, person, email, color, phone) {
  contactsSingleViewContainer.innerHTML = "";
  contactsSingleViewContainer.appendChild(
    renderSingleContactView(shortName, person, email, color, phone)
  );
}

function openAddContactDialog() {
  addContactDialog.showModal();
    startEventListenersAddContactDialog();
}

function startEventListenersAddContactDialog() {
    document.getElementById("add_contact_color_picker_id").addEventListener("input", (event) => {
        document.documentElement.style.setProperty("--contact-color", event.target.value);
      });
      document.getElementById("add_contact_name_id").addEventListener("blur", (event) => {
        if (event.target.value != "") {
        let showFirstLetters = contactListInitials(event.target.value);
        changeImgToInitials(showFirstLetters);
        }
        else {
            resetPersonInitials();
        }
      });
}

function changeImgToInitials(initials) {    
    let imgElement = document.getElementById("person_icon_id");
    if (imgElement === null) {
        document.getElementById("person_initials_id").textContent = initials;
        return;
    }
    let initialsElement = renderPersonInitialsForAddContact(initials);
    imgElement.replaceWith(initialsElement);
}

function resetPersonInitials() {
    let initialsElement = document.getElementById("person_initials_id");
    if (initialsElement === null) {
        return;
    }
    let imgElement = document.createElement("img");
    imgElement.id = "person_icon_id";
    imgElement.src = "assets/img/person64x64.webp";
    imgElement.alt = "Person Icon";
    initialsElement.replaceWith(imgElement);
}

function closeAddContactDialog() {
  addContactDialog.close();
    document.documentElement.style.setProperty("--contact-color", "#D1D1D1");
    deleteInputValues();
    resetPersonInitials();
}

function addNewContact(event) {
  event.preventDefault();
  let name = document.getElementById("add_contact_name_id").value;
  let email = document.getElementById("add_contact_email_id").value;
  let phone = document.getElementById("add_contact_phone_id").value;
  let color = document.getElementById("add_contact_color_picker_id").value;
  // contactsList.push({name, email, phone, color});
  // contactsListContainer.innerHTML = "";
  console.log(name, email, phone, color);
  deleteInputValues();
  // firstLetterList = [];
  // letterSeperatorContactsList();
  // closeAddContactDialog();
}

function deleteInputValues() {
  document.getElementById("add_contact_name_id").value = "";
  document.getElementById("add_contact_email_id").value = "";
  document.getElementById("add_contact_phone_id").value = "";
  document.getElementById("add_contact_color_picker_id").value = "#D1D1D1";
}

function openEditContactDialog(shortName, person, email, color, phone) {
    editContactDialog.showModal();
    openEditInput(shortName, person, email, color, phone);

}

function closeEditContactDialog() {
    editContactDialog.close();
}

function openEditInput(shortName, person, email, color, phone) {
    editContactInputContainer.appendChild(
        renderEditContactInput(shortName, person, email, color, phone)
    );
  }