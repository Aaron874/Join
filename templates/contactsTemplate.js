import {
    createListenerForContactInList,
    contactsList,
    openDeleteDialogBtnListener,
    updateContactBtnListener,
    deleteBtnListener,
    returnToListBtnListener,
    DEFAULT_CONTACT_COLOR
} from '../scripts/contacts.js';

import { openEditDialogBtnListener, } from '../scripts/contactsAddandEdit.js';


/**
 * Renders the HTML markup for a single letter separator used in the contact list.
 *
 * @param {string} Letter - The letter to be displayed and set as the `data-letter` attribute.
 * @returns {string} The HTML string for the letter separator element.
 *
 * @example
 * const html = renderContactsListLetterSeperator('J');
 */
export function renderContactsListLetterSeperator(Letter) {
    return `
     <div class="contacts_list_letter_seperator" data-letter="${Letter}">${Letter}</div>`;
}

/**
 * Creates a single contact list item element with avatar, name, and email,
 * and registers a click listener to open the contact's single view.
 *
 * @param {string} shortName - The contact's initials, displayed in the avatar.
 * @param {string} person - The full name of the contact.
 * @param {string} email - The contact's email address, rendered as a mailto link.
 * @param {string} [color='#BDBDBD'] - The color used for the avatar background.
 * @param {string|number} id - The unique identifier of the contact, used to build the element's DOM id and register the click listener.
 * @returns {HTMLButtonElement} The created contact list item element.
 *
 * @example
 * const item = renderContactsListItems('JD', 'John Doe', 'john@example.com', '#FF5733', contact.id);
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
 * Creates the heading element for the contact dialog header, with text depending
 * on whether the dialog is in add or edit mode.
 *
 * @param {boolean} [isEditMode=false] - Whether the dialog is in edit mode (`true`) or add mode (`false`).
 * @returns {HTMLHeadingElement} The created `<h3>` heading element with the appropriate text.
 *
 * @example
 * const heading = renderAddOrEditContactDialog(true); // 'Edit Contact'
 * const heading = renderAddOrEditContactDialog(); // 'Add Contact'
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
 * Creates the underline/subtitle text element displayed below the heading
 * in the contact dialog header.
 *
 * @returns {HTMLParagraphElement} The created `<p>` element containing the subtitle text.
 *
 * @example
 * const subtitle = renderUnderlineHeaderContactDialog();
 */
export function renderUnderlineHeaderContactDialog() {
    let contactDialogUnderline = document.createElement('p');
    contactDialogUnderline.textContent = 'Tasks are better with a team!';
    return contactDialogUnderline;
}

/**
 * Creates the single contact view element with the contact's details (avatar,
 * name, email, phone) and action buttons. Registers the click listeners for
 * the edit, delete, and mobile back-to-list buttons within the view.
 *
 * @param {string} shortName - The contact's initials, displayed in the avatar.
 * @param {string} person - The full name of the contact.
 * @param {string} email - The contact's email address, rendered as a mailto link.
 * @param {string} [color='#BDBDBD'] - The color used for the avatar background.
 * @param {string} [phone='No phone number'] - The contact's phone number.
 * @param {string|number} id - The unique identifier of the contact, used to register the edit and delete listeners.
 * @returns {HTMLDivElement} The created single contact view element.
 *
 * @example
 * const view = renderSingleContactView('JD', 'John Doe', 'john@example.com', '#FF5733', '123456', contact.id);
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
 * Creates the avatar preview element showing the given initials, used in the
 * add contact dialog as a substitute for the default person icon.
 *
 * @param {string} initials - The initials to be displayed in the avatar preview.
 * @returns {HTMLSpanElement} The created `<span>` element containing the initials.
 *
 * @example
 * const initialsElement = renderPersonInitialsForAddContact('JD');
 */
export function renderPersonInitialsForAddContact(initials) {
    let personInitials = document.createElement('span');
    personInitials.classList.add('person_initials');
    personInitials.id = 'person_initials_id';
    personInitials.textContent = initials;
    return personInitials;
}


/**
 * Creates the contact form used for both adding and editing a contact.
 * Pre-fills the color picker, initials, name, email, and phone fields with the
 * existing contact's data when `contactId` refers to an existing contact,
 * otherwise falls back to empty values/default color. Renders the appropriate
 * action buttons based on `mode` and registers the update and delete listeners.
 *
 * @param {string} [mode] - The form mode, e.g. `'edit'` or `undefined`/other value for add mode. Passed through to `renderButtons`.
 * @param {string|number} [contactId] - The index used to look up the existing contact in `contactsList`. Omit or leave undefined when creating a new contact.
 * @returns {HTMLDivElement} The created contact form container element.
 *
 * @example
 * const form = renderContactInput('edit', contactId);
 * const form = renderContactInput(); // add mode
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
 * Renders the appropriate action buttons markup for the contact form,
 * depending on whether it is used in edit or add mode. In edit mode,
 * renders "Delete" and "Save" buttons; otherwise renders "Cancel" and
 * "Create contact" buttons.
 *
 * @param {string} [mode] - The form mode, e.g. `'edit'` or `undefined`/other value for add mode.
 * @returns {string} The HTML string for the button container matching the given mode.
 *
 * @example
 * const buttons = renderButtons('edit');
 * const buttons = renderButtons(); // add mode
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
