import { openSingleViewContact, openEditContactDialog, updateContactInList, deleteContactDialog } from "./contacts.js";


export function renderContactsList(Letter) {
    return `
     <div class="contacts_list_letter_seperator" data-letter="${Letter}">${Letter}</div>`
}

export function renderContactsListItems(shortName, person, email, color = "#BDBDBD", phone, id) {
    let newContact = document.createElement("button");
    newContact.classList.add("contacts_list_items_container");
    newContact.id = ("contact_id_" + id);
    newContact.innerHTML = `
          <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
          <div>
            <h4>${person}</h4>
            <p><a href="mailto:${email}">${email}</a></p>
          </div>
          `;
          newContact.addEventListener("click", () => {
            openSingleViewContact(id);
          });
        return newContact;
}

export function renderAddOrEditContactDialog(isEditMode = false) {
  let addContactDialogContent = document.createElement("h3");
  if (isEditMode) {
    addContactDialogContent.textContent = "Edit Contact";
  } else {
    addContactDialogContent.textContent = "Add Contact";
  }
  return addContactDialogContent;
}

export function renderUnderlineHeaderContactDialog() {
  let contactDialogUnderline = document.createElement("p");
  contactDialogUnderline.textContent = "Tasks are better with a team!";
  return contactDialogUnderline;
}


export function renderSingleContactView(shortName, person, email, color = "#BDBDBD", phone = "No phone number", id) {
    let newSingleView = document.createElement("div");
    newSingleView.innerHTML = `
            <div class="contacts_single_view_content_header">
              <div class="contacts_icon" style="--contact-color: ${color};" >${shortName}</div>
              <div>
                <h3 class="contacts_single_view_name">${person}</h3>
                <div class="contacts_single_view_actions">
                  <button id="edit_btn_id">
                    <img src="assets/img/edit.webp" alt="Edit Contact" />Edit
                  </button>
                  <button id="delete_btn_id">
                    <img
                      src="assets/img/delete.webp"
                      alt="Delete Contact"
                    />Delete
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p class="contacts_single_view_information_header">Contact Information</p>
              <div class="contacts_single_view_content_information">
                <h4>Email</h4>
                <p class="contacts_single_view_email"><a href="mailto:${email}"  >${email}</a></p>
                <h4>Phone</h4>
                <p class="contacts_single_view_phone" >${phone}</p>
              </div>
            </div>
            `
            const editButton = newSingleView.querySelector("#edit_btn_id");
            editButton.addEventListener("click", () => {
              openEditContactDialog(shortName, person, email, color, phone, id);
            });
            const deleteButton = newSingleView.querySelector("#delete_btn_id");
            deleteButton.addEventListener("click", () => {
              deleteContactDialog(id, person);
            });
              
    return newSingleView;
}

export function renderPersonInitialsForAddContact(initials) {
  let personInitials = document.createElement("span");
  personInitials.classList.add("person_initials");
  personInitials.id = "person_initials_id";
  personInitials.textContent = initials;
  return personInitials;
}

export function renderContactInput(shortName, person, email, color, phone, mode, id) {
  let editContactInput = document.createElement("div");
  editContactInput.classList.add("contact_form_container");
  editContactInput.id = "contact_input_id";
  editContactInput.innerHTML = `
            <label class="contact_color_picker" style="--contact-color: ${color ?? "#D1D1D1"};">
              <input
                type="color"
                name="background_color"
                id="contact_color_picker_id"
                value="${color ?? "#D1D1D1"}"
              />
              <span class="person_initials" id="person_initials_id">${shortName ?? ""}</span>
            </label>
            <form action="" method="post" id="contact_form_id">
              <div class="contact_input_wrapper">
                <input
                  type="text"
                  value="${person ?? ""}"
                  name="name"
                  id="contact_name_id"
                  placeholder="Name"
                  minlength="2"
                  maxlength="50"
                  pattern="[\\p{L}' \\-]{2,100}""
                  title="Der Name darf nur Buchstaben, Leerzeichen, Apostrophe und Bindestriche enthalten."
                  required
                />
                <img src="assets/img/person24x24.webp" alt="Person Icon" />
              </div>
              <div class="contact_input_wrapper">
                <input 
                  type="email" 
                  name="email" 
                  id="contact_email_id" 
                  placeholder="E-Mail" 
                  value="${email ?? ""}" 
                  required/>
                <img src="assets/img/mail.webp" alt="E-Mail Icon" />
              </div>
              <div class="contact_input_wrapper">
                <input 
                  type="tel" 
                  name="phone" 
                  id="contact_phone_id" 
                  placeholder="+49 12345678910"
                  minlength="6"
                  maxlength="20"
                  pattern="\\+?[0-9 ]{6,20}"
                  title= "Bitte geben Sie eine gültige Telefonnummer ein, z. B. +49 171 1234567."
                  value="${phone ?? ""}" 
                  required/>
                <img src="assets/img/call.webp" alt="Phone Icon" />
              </div>
              ${renderButtons(mode)}
            </form>
`
const changeBtn = editContactInput.querySelector("#change_contact_btn_id");
if (changeBtn) {
  changeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    let contactId = id;
    const updatedContact = {
      name: document.getElementById("contact_name_id").value,
      email: document.getElementById("contact_email_id").value,
      phone: document.getElementById("contact_phone_id").value,
      color: document.getElementById("contact_color_picker_id").value,
    };
    updateContactInList(contactId, updatedContact);
  });
}
const deleteBtn = editContactInput.querySelector("#edit_contact_btn_delete_id");
if (deleteBtn) {
  deleteBtn.addEventListener("click", (event) => {
    event.preventDefault();
    deleteContactDialog(id, person);
  });
}
return editContactInput;
}



function renderButtons(mode) {
  if (mode === "edit") {
    return `
    <div class="contact_btn_container" >
      <button
        class="edit_contact_btn_cancel"
        id="edit_contact_btn_delete_id">
        Delete
      </button>
      <button class="contact_btn_submit" type="submit" id="change_contact_btn_id">
        Save
        <span>
          <img src="assets/img/check.webp" alt="Check Icon" />
        </span>
      </button>
      </div>
    `
  } else {

    return `
              <div class="contact_btn_container">
                <button
                  class="add_contact_btn_cancel"
                  type="reset"
                  data-action="close_dialog_contact"
                >
                  Cancel
                  <span
                    ><img
                      src="assets/img/iconoir_cancel.webp"
                      alt="Delete Icon"
                  /></span>
                </button>
                <button class="contact_btn_submit" type="submit" data-action="create_contact">
                  Create contact
                  <span
                    ><img src="assets/img/check.webp" alt="Check Icon"
                  /></span>
                </button>
              </div>
`}
}