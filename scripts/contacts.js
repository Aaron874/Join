import { db, auth } from "../firebase/firebase-config.js";
import { guestLogin } from "../firebase/auth.js";
import { createContact } from "../firebase/contacts.service.js";
import {
  getContacts,
  updateContact,
  getContact,
  deleteContact,
} from "../firebase/contacts.service.js";
import {
  renderContactsList,
  renderContactsListItems,
  renderSingleContactView,
  renderAddOrEditContactDialog,
  renderUnderlineHeaderContactDialog,
  renderPersonInitialsForAddContact,
  renderContactInput,
} from "./contactsTemplate.js";

export let contactsList = [];
let firstLetterList = [];
const contactsListContainer = document.querySelector(
  ".contacts_list_container"
);
const contactsSingleViewContainer = document.querySelector(
  "#contacts_single_view_content_id"
);
const contactDialog = document.getElementById("contact_dialog_id");
const contactDialogHeader = document.getElementById("contact_dialog_header_id");
const editContactInputContainer = document.getElementById(
  "contact_form_section_id"
);

window.result = await guestLogin();

loadContacts();

async function loadContacts() {
  contactsList = await getContacts();
  letterSeperatorContactsList();
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "open_dialog_contact") {
    openAddContactDialog();
  }
  if (action === "close_dialog_contact") {
    closeAddContactDialog();
  }
});

document.addEventListener("submit", (event) => {
  if (!event.target.matches("#contact_form_id")) return;
  event.preventDefault();
  switch (event.submitter.dataset.action) {
    case "create_contact":
      addNewContact();
      break;
    case "update_contact":
      break;
  }
});


function letterSeperatorContactsList() {
  firstLetterList = [];
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

function createContactListItems() {
  for (let index = 0; index < contactsList.length; index++) {
    let shortName = contactsList[index].shortName;
    let person = contactsList[index].name;
    let email = contactsList[index].email;
    let firstLetter = contactsList[index].name[0].toUpperCase();
    let color = contactsList[index].color;
    let id = contactsList[index].id;
    let targetElement = document.querySelector(`[data-letter="${firstLetter}"]`);
    targetElement.after(
      renderContactsListItems(shortName, person, email, color, id)
    );
  }
}

export function createListenerForContactInList(newContact, id) {
  newContact.addEventListener("click", () => {
    openSingleViewContact(id);
  });
}

function contactListInitials(contactListName) {
  let initials = contactListName
    .split(" ")
    .splice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials;
}

export function openSingleViewContact(id) {
  const contactIndex = searchIndex(id);
  const contact = contactsList[contactIndex];
  contactsSingleViewContainer.innerHTML = "";
  contactsSingleViewContainer.appendChild(
    renderSingleContactView(
      contact.shortName,
      contact.name,
      contact.email,
      contact.color,
      contact.phone,
      contact.id
    )
  );
}

export function openEditDialogBtnListener(newSingleView, id){
  const editButton = newSingleView.querySelector("#edit_btn_id");
  editButton.addEventListener("click", () => {
    openEditContactDialog(id);
  });
}

function openAddContactDialog() {
  contactDialog.showModal();
  contactDialogHeaderSwitch();
  contactDialogHeader.appendChild(renderUnderlineHeaderContactDialog());
  openEditInput();
  startEventListenerColorPicker();
  startEventListenersAddContactDialog();
}

function startEventListenersAddContactDialog() {
  document
    .getElementById("contact_name_id")
    .addEventListener("blur", (event) => {
      if (event.target.value != "") {
        let showFirstLetters = contactListInitials(event.target.value);
        changeImgToInitials(showFirstLetters);
      } else {
        resetPersonInitials();
      }
    });
}

function startEventListenerColorPicker() {
  document
    .getElementById("contact_color_picker_id")
    .addEventListener("input", (event) => {
      event.target.parentElement.style.setProperty(
        "--contact-color",
        event.target.value
      );
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
  contactDialog.close();
  document.documentElement.style.setProperty("--contact-color", "#D1D1D1");
  deleteInputValues();
  resetPersonInitials();
}

function addNewContact() {
  let contact = {
    name: document.getElementById("contact_name_id").value,
    email: document.getElementById("contact_email_id").value,
    phone: document.getElementById("contact_phone_id").value,
    color: document.getElementById("contact_color_picker_id").value,
    shortName: contactListInitials(
      document.getElementById("contact_name_id").value
    ),
  };
  writeNewContact(contact);
}

async function writeNewContact(contact) {
  try {
    await createContact(contact);
    contactsList.push(contact);
    removeContactListfromDom();
    letterSeperatorContactsList();
    closeAddContactDialog();
    contactSuccessDialog();
    openSingleViewContact(contact.id);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function deleteInputValues() {
  document.getElementById("contact_name_id").value = "";
  document.getElementById("contact_email_id").value = "";
  document.getElementById("contact_phone_id").value = "";
  document.documentElement.style.setProperty("--contact-color", "#D1D1D1");
}

export function openEditContactDialog(
  // shortName,
  // person,
  // email,
  // color,
  // phone,
  id
) {
  contactDialog.showModal();
  contactDialogHeaderSwitch(true);
  openEditInput("edit", id);
  startEventListenerColorPicker();
}

export function contactDialogHeaderSwitch(state) {
  contactDialogHeader.innerHTML = "";
  contactDialogHeader.appendChild(renderAddOrEditContactDialog(state));
}


function openEditInput(mode, id) {
  const existingInput = document.getElementById("contact_input_id");
  if (existingInput) {
    existingInput.remove();
  }
  let contactId = searchIndex(id);
  editContactInputContainer.appendChild(
    renderContactInput(mode, contactId));
}

function contactSuccessDialog() {
  const successDialog = document.getElementById("contact_dialog_success_id");
  successDialog.showModal();
  setTimeout(() => {
    successDialog.close();
  }, 2000);
}

export async function updateContactInList(contactId, updatedContact) {
  await updateContact(contactId, updatedContact);
  let contactIndex = searchIndex(contactId);
  let changedContact = await getContact(contactId);
  contactsList[contactIndex] = changedContact;
  changeContactInDom(contactId, changedContact);
  closeAddContactDialog();
  openSingleViewContact(contactId);
}

function searchIndex(contactId) {
  for (let index = 0; index < contactsList.length; index++) {
    if (contactsList[index].id === contactId) {
      return index;
    }
  }
}

function changeContactInDom(contactId, changedContact) {
  const button = document.getElementById("contact_id_" + contactId);
  button.querySelector("h4").textContent = changedContact.name;
  button.querySelector("p").textContent = changedContact.email;
  button.querySelector(".contacts_list_name_symbol").textContent =
    changedContact.shortName;
  button
    .querySelector(".contacts_list_name_symbol")
    .style.setProperty("--contact-color", changedContact.color);
}

export function deleteContactDialog(contactId, person) {
  const deleteDialog = document.getElementById("contact_dialog_delete_id");
  deleteDialog.showModal();
  const userNameSpan = deleteDialog.querySelector("#user_name_id");
  userNameSpan.textContent = "";
  userNameSpan.textContent = person;
  const deleteButton = deleteDialog.querySelector("button:first-of-type");
  const cancelButton = deleteDialog.querySelector("button:last-of-type");
  eventListenerDeleteContactDialog(
    contactId,
    deleteButton,
    cancelButton,
    deleteDialog
  );
}

function eventListenerDeleteContactDialog(
  contactId,
  deleteButton,
  cancelButton,
  deleteDialog
) {
  deleteButton.addEventListener("click", async () => {
    await deleteContact(contactId);
    removeContactFromDom(contactId);
    deleteDialog.close();
    if (contactDialog.open) {
      contactDialog.close();
    }
  });
  cancelButton.addEventListener("click", () => {
    deleteDialog.close();
  });
}

function removeContactFromDom(contactId) {
  const indexContact = searchIndex(contactId);
  contactsList.splice(indexContact, 1);
  removeContactListfromDom();
  letterSeperatorContactsList();
  const firstContactListItem = seperatIdFromContactList();
  openSingleViewContact(firstContactListItem);
}

function removeContactListfromDom() {
  const contactListElements = document.querySelectorAll(
    ".contacts_list_items_container, .contacts_list_letter_seperator"
  );
  contactListElements.forEach((element) => {
    element.remove();
  });
}

function seperatIdFromContactList() {
  const firstContactListItem = document.querySelector(
    ".contacts_list_items_container"
  );
  const contactId = firstContactListItem.id.split("_")[2];
  return contactId;
}
