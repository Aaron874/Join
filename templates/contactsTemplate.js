import {
    createListenerForContactInList,
    openEditDialogBtnListener,
    contactsList,
    openDeleteDialogBtnListener,
    updateContactBtnListener,
    deleteBtnListener,
    returnToListBtnListener,
    DEFAULT_CONTACT_COLOR
} from '../scripts/contacts.js';

/**
 * Render a list separator for the contacts list by letter.
 *
 * @param {string} Letter - The letter used as the separator label.
 * @returns {string} HTML string for the list letter separator.
 */
export function renderContactsListLetterSeperator(Letter) {
    return `
     <div class="contacts_list_letter_seperator" data-letter="${Letter}">${Letter}</div>`;
}

/**
 * Render a contact list item as a button element.
 *
 * @param {string} shortName - The initials or short label shown in the contact badge.
 * @param {string} person - The full name of the contact.
 * @param {string} email - The contact email address.
 * @param {string} [color='#BDBDBD'] - The color value used for the initials badge.
 * @param {string|number} id - The unique identifier for the contact.
 * @returns {HTMLButtonElement} The rendered contact button element.
 */
export function renderContactsListItems(shortName, person, email, color = '#BDBDBD', id) {
    let newContact = document.createElement('button');
    newContact.classList.add('contacts_list_items_container');
    newContact.id = 'contact_id_' + id;
    newContact.innerHTML = `
          <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
          <div>
            <h4>${person}</h4>
            <p><a href="mailto:${email}">${email}</a></p>
          </div>
          `;
    createListenerForContactInList(newContact, id);
    return newContact;
}

/**
 * Render the dialog heading for adding or editing a contact.
 *
 * @param {boolean} [isEditMode=false] - Whether the dialog is in edit mode.
 * @returns {HTMLHeadingElement} The heading element for the dialog.
 */
export function renderAddOrEditContactDialog(isEditMode = false) {
    let addContactDialogContent = document.createElement('h3');
    if (isEditMode) {
        addContactDialogContent.textContent = 'Edit Contact';
    } else {
        addContactDialogContent.textContent = 'Add Contact';
    }
    return addContactDialogContent;
}

/**
 * Render the subtitle text for the contact dialog header.
 *
 * @returns {HTMLParagraphElement} The paragraph element containing the dialog subtitle.
 */
export function renderUnderlineHeaderContactDialog() {
    let contactDialogUnderline = document.createElement('p');
    contactDialogUnderline.textContent = 'Tasks are better with a team!';
    return contactDialogUnderline;
}

/**
 * Render the detailed single contact view element.
 *
 * @param {string} shortName - The initials or short label for the contact.
 * @param {string} person - The contact's display name.
 * @param {string} email - The contact's email address.
 * @param {string} [color='#BDBDBD'] - The badge color for the contact initials.
 * @param {string} [phone='No phone number'] - The contact's phone number.
 * @param {string|number} id - The unique identifier for the contact.
 * @returns {HTMLDivElement} The rendered single contact view container.
 */
export function renderSingleContactView(
    shortName,
    person,
    email,
    color = '#BDBDBD',
    phone = 'No phone number',
    id
) {
    let newSingleView = document.createElement('div');
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
            <button id="mobile_edit_btn_id" class="mobile_edit_btn">
              <img
                src="assets/img/more_vert.webp"
                alt="Edit Contact"
            </button>
            <button id="mobile_back_btn_id" class="mobile_back_btn">
              <img
                src="assets/img/arrow-left-line.webp"
                alt="Back to Contact List Button"
            </button>
            `;
    openEditDialogBtnListener(newSingleView, id);
    openDeleteDialogBtnListener(newSingleView, id, person);
    returnToListBtnListener(newSingleView);
    return newSingleView;
}

/**
 * Render the initials element for the add contact form.
 *
 * @param {string} initials - The initials text to display.
 * @returns {HTMLSpanElement} The span element containing the initials.
 */
export function renderPersonInitialsForAddContact(initials) {
    let personInitials = document.createElement('span');
    personInitials.classList.add('person_initials');
    personInitials.id = 'person_initials_id';
    personInitials.textContent = initials;
    return personInitials;
}

/**
 * Render the contact input form markup for add or edit mode.
 *
 * @param {'add'|'edit'} mode - The current form mode.
 * @param {string|number} contactId - The id of the contact being edited.
 * @returns {HTMLDivElement} The rendered contact form container.
 */
export function renderContactInput(mode, contactId) {
    let editContactInput = document.createElement('div');
    editContactInput.classList.add('contact_form_container');
    editContactInput.id = 'contact_input_id';
    editContactInput.innerHTML = `
            <label class="contact_color_picker" style="--contact-color: ${
                contactsList[contactId]?.color ?? DEFAULT_CONTACT_COLOR
            };">
              <input
                type="color"
                name="background_color"
                id="contact_color_picker_id"
                value="${contactsList[contactId]?.color ?? DEFAULT_CONTACT_COLOR}"
              />
              <span class="person_initials" id="person_initials_id">${
                  contactsList[contactId]?.shortName ?? ''
              }</span>
            </label>
            <form action="" method="post" id="contact_form_id">
              <div class="contact_input_wrapper">
                <input
                  type="text"
                  value="${contactsList[contactId]?.name ?? ''}"
                  name="name"
                  id="contact_name_id"
                  placeholder="Name"
                  minlength="2"
                  maxlength="50"
                  pattern="[\\p{L}' \\-]{2,100}"
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
                  value="${contactsList[contactId]?.email ?? ''}" 
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
                  value="${contactsList[contactId]?.phone ?? ''}" 
                  required/>
                <img src="assets/img/call.webp" alt="Phone Icon" />
              </div>
              ${renderButtons(mode)}
            </form>
`;
    updateContactBtnListener(editContactInput, contactId);
    deleteBtnListener(contactId, contactsList[contactId]?.name, editContactInput);
    return editContactInput;
}

/**
 * Render the contact form action buttons depending on mode.
 *
 * @param {'add'|'edit'} mode - The current form mode.
 * @returns {string} HTML string for the action buttons.
 */
function renderButtons(mode) {
    if (mode === 'edit') {
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
    `;
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
`;
    }
}
