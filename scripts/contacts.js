import { db, auth } from '../firebase/firebase-config.js';
import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { createContact } from '../firebase/contacts.service.js';
import {
    getContacts,
    updateContact,
    getContact,
    deleteContact,
} from '../firebase/contacts.service.js';
import {
    renderContactsListLetterSeperator,
    renderContactsListItems,
    renderSingleContactView,
    renderAddOrEditContactDialog,
    renderUnderlineHeaderContactDialog,
    renderPersonInitialsForAddContact,
    renderContactInput,
} from '../templates/contactsTemplate.js';

export let contactsList = [];
let firstLetterList = [];
export const DEFAULT_CONTACT_COLOR = '#D1D1D1';
const MOBILE_BREAKPOINT = 701;
const SUCCESS_DIALOG_TIMEOUT = 2000;
const contactsListContainer = document.querySelector('.contacts_list_container');
const contactsSingleViewContainer = document.querySelector('#contacts_single_view_content_id');
const contactDialog = document.getElementById('contact_dialog_id');
const contactDialogHeader = document.getElementById('contact_dialog_header_id');
const editContactInputContainer = document.getElementById('contact_form_section_id');

window.result = await waitForAuthenticatedUser();

loadContacts();

async function loadContacts() {
    contactsList = await getContacts();
    getFirstLetterForSeperator();
}

document.addEventListener('click', (e) => {
    const element = e.target.closest('[data-action]');
    if (!element) return;
    const action = element.dataset.action;
    if (action === 'open_dialog_contact') {
        openAddContactDialog();
    }
    if (action === 'close_dialog_contact') {
        closeAddContactDialog();
    }
});

document.addEventListener('submit', (event) => {
    if (!event.target.matches('#contact_form_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'create_contact':
            getNewContactValues();
            break;
        case 'update_contact':
            break;
    }
});

/**
 * Registers a click event listener on the edit button of a contact's single view.
 * Selects either the mobile or desktop edit button depending on the current screen width,
 * and opens the edit dialog for the given contact when clicked.
 *
 * @param {HTMLElement} newSingleView - The DOM element of the single contact view in which the button is searched for.
 * @param {string|number} id - The ID of the contact to be opened in the edit dialog.
 * @returns {void}
 *
 * @example
 * openEditDialogBtnListener(singleViewElement, contact.id);
 */
export function openEditDialogBtnListener(newSingleView, id) {
  let screenSize = window.innerWidth
  let editButton;
  if (screenSize < MOBILE_BREAKPOINT) {
    editButton = newSingleView.querySelector('#mobile_edit_btn_id');
  } else {
    editButton = newSingleView.querySelector('#edit_btn_id');
  }
    editButton.addEventListener('click', () => {
        openEditContactDialog(id);
    });
}


/**
 * Registers a click event listener on the delete button of the contact's single view.
 * Only attaches the listener when the screen width is above the mobile breakpoint,
 * since the delete button is not available in the mobile layout.
 * Opens the delete confirmation dialog for the given contact when clicked.
 *
 * @param {HTMLElement} newSingleView - The DOM element of the single contact view in which the button is searched for.
 * @param {string|number} id - The ID of the contact to be deleted.
 * @param {Object} person - The contact object/data to be passed to the delete dialog.
 * @returns {void}
 *
 * @example
 * openDeleteDialogBtnListener(singleViewElement, contact.id, contact);
 */
export function openDeleteDialogBtnListener(newSingleView, id, person) {
  let screenSize = window.innerWidth
  if (screenSize > MOBILE_BREAKPOINT) {
    const deleteButton = newSingleView.querySelector('#delete_btn_id');
    deleteButton.addEventListener('click', () => {
        deleteContactDialog(id, person);
    });
  }
}


/**
 * Registers a click event listener on the delete button inside the edit contact form.
 * Looks up the actual contact identifier from the global contacts list using the given
 * contact index/id and opens the delete confirmation dialog when clicked.
 *
 * @param {string|number} contactId - The index or key used to look up the contact in `contactsList`.
 * @param {Object} person - The contact object/data to be passed to the delete dialog.
 * @param {HTMLElement} editContactInput - The DOM element of the edit contact form in which the button is searched for.
 * @returns {void}
 *
 * @example
 * deleteBtnListener(contactId, contact, editFormElement);
 */
export function deleteBtnListener(contactId, person, editContactInput) {
    const deleteBtn = editContactInput.querySelector('#edit_contact_btn_delete_id');
    if (deleteBtn) {
        let contactIdent = contactsList[contactId].id;
        deleteBtn.addEventListener('click', (event) => {
            event.preventDefault();
            deleteContactDialog(contactIdent, person);
        });
    }
}

/**
 * Registers a click event listener on the mobile "back to list" button of the contact's single view.
 * Switches the view back from the single contact view to the contact list when clicked.
 *
 * @param {HTMLElement} newSingleView - The DOM element of the single contact view in which the button is searched for.
 * @returns {void}
 *
 * @example
 * returnToListBtnListener(singleViewElement);
 */
export function returnToListBtnListener (newSingleView) {
  const returnToListBtn = newSingleView.querySelector('#mobile_back_btn_id');
  returnToListBtn.addEventListener('click', () => {
    switchListToSingleViewAndBack();
  })
}


/**
 * Builds the list of first letters used as section separators for the contact list.
 * Iterates over the global `contactsList`, extracts the first letter of each contact's
 * name (only if it is a valid German alphabet character), uppercases it, and stores it
 * in the global `firstLetterList`. Afterwards triggers sorting of the separator list.
 *
 * @returns {void}
 *
 * @example
 * getFirstLetterForSeperator();
 */
function getFirstLetterForSeperator() {
    firstLetterList = [];
    for (let index = 0; index < contactsList.length; index++) {
        if (/^[a-zA-ZäöüÄÖÜß]$/.test(contactsList[index].name[0])) {
            let firstLetter = contactsList[index].name[0].toUpperCase();
            firstLetterList.push(firstLetter);
        }
    }
    sortLetterSeperatorList();
}


/**
 * Removes duplicate letters from the global `firstLetterList` and sorts the remaining
 * letters alphabetically using German locale rules. Afterwards triggers the creation
 * of the letter separators in the contact list UI.
 *
 * @returns {void}
 *
 * @example
 * sortLetterSeperatorList();
 */
function sortLetterSeperatorList() {
    firstLetterList = [...new Set(firstLetterList)];
    firstLetterList.sort((a, b) => a.localeCompare(b, 'de'));
    createContactsListLetterSeperator();
}


/**
 * Renders the letter separator elements into the contact list container based on the
 * global `firstLetterList`. For each letter, appends the corresponding separator markup
 * to `contactsListContainer`. Afterwards triggers the creation of the contact list items.
 *
 * @returns {void}
 *
 * @example
 * createContactsListLetterSeperator();
 */
function createContactsListLetterSeperator() {
    for (let index = 0; index < firstLetterList.length; index++) {
        contactsListContainer.innerHTML += renderContactsListLetterSeperator(
            firstLetterList[index]
        );
    }
    createContactListItems();
}


/**
 * Iterates over the global `contactsList` and extracts the relevant Contact data
 * (short name, full name, email, first letter, color, and id) for each contact.
 * Delegates the actual rendering of each contact list item to `pushContactsToList`.
 *
 * @returns {void}
 *
 * @example
 * createContactListItems();
 */
function createContactListItems() {
    for (let index = 0; index < contactsList.length; index++) {
        let shortName = contactsList[index].shortName;
        let person = contactsList[index].name;
        let email = contactsList[index].email;
        let firstLetter = contactsList[index].name[0].toUpperCase();
        let color = contactsList[index].color;
        let id = contactsList[index].id;
        pushContactsToList(shortName, person, email, firstLetter, color, id);
    }
}


/**
 * Inserts a single rendered contact list item into the DOM, placing it directly after
 * the letter separator element matching the given first letter.
 *
 * @param {string} shortName - The contact's initials/short name used for the avatar.
 * @param {string} person - The full name of the contact.
 * @param {string} email - The contact's email address.
 * @param {string} firstLetter - The first letter of the contact's name, used to locate the corresponding separator element via `data-letter`.
 * @param {string} color - The color used for the contact's avatar/badge.
 * @param {string|number} id - The unique identifier of the contact.
 * @returns {void}
 *
 * @example
 * pushContactsToList('JD', 'John Doe', 'john@example.com', 'J', '#FF5733', contact.id);
 */
function pushContactsToList(shortName, person, email, firstLetter, color, id) {
    let targetElement = document.querySelector(`[data-letter="${firstLetter}"]`);
    targetElement.after(renderContactsListItems(shortName, person, email, color, id));
}

/**
 * Registers a click event listener on a contact list item element.
 * Opens the single contact view for the given contact when clicked.
 *
 * @param {HTMLElement} newContact - The DOM element representing the contact list item.
 * @param {string|number} id - The ID of the contact to be opened in the single view.
 * @returns {void}
 *
 * @example
 * createListenerForContactInList(contactListItemElement, contact.id);
 */
export function createListenerForContactInList(newContact, id) {
    newContact.addEventListener('click', () => {
        openSingleViewContact(id);
    });
}

/**
 * Opens and renders the single contact view for the given contact.
 * Looks up the contact's index in the global `contactsList`, switches the UI from
 * list view to single view, clears the current single view container, and renders
 * the contact's details into it.
 *
 * @param {string|number} id - The ID of the contact to be displayed in the single view.
 * @returns {void}
 *
 * @example
 * openSingleViewContact(contact.id);
 */
export function openSingleViewContact(id) {
    const contactIndex = searchIndex(id);
    switchListToSingleViewAndBack();
    const contact = contactsList[contactIndex];
    contactsSingleViewContainer.innerHTML = '';
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


/**
 * Toggles the visibility between the contact list and the single contact view
 * on mobile screens. Only applies when the screen width is below the mobile
 * breakpoint; on larger screens both views remain visible/unaffected.
 *
 * @returns {void}
 *
 * @example
 * switchListToSingleViewAndBack();
 */
function switchListToSingleViewAndBack() {
    let width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) {
        const viewContainer = document.querySelector('.contacts_single_view_container');
        const listContainer = document.querySelector('.contacts_list_container');
        viewContainer.classList.toggle('visible_flex');
        listContainer.classList.toggle('hidden');
}
}


/**
 * Searches the global `contactsList` for a contact matching the given ID and
 * returns its index within the array.
 *
 * @param {string|number} contactId - The ID of the contact to search for.
 * @returns {number|undefined} The index of the matching contact in `contactsList`,
 * or `undefined` if no contact with the given ID is found.
 *
 * @example
 * const index = searchIndex(contact.id);
 */
function searchIndex(contactId) {
    for (let index = 0; index < contactsList.length; index++) {
        if (contactsList[index].id === contactId) {
            return index;
        }
    }
}


/**
 * Registers a click event listener on the update/save button inside the edit contact form.
 * On click, reads the current values from the name, email, phone, and color input fields,
 * builds an updated contact object, and passes it along with the resolved contact identifier
 * to `updateContactInList`.
 *
 * @param {HTMLElement} editContactInput - The DOM element of the edit contact form in which the button is searched for.
 * @param {string|number} contactId - The index or key used to look up the contact in `contactsList`.
 * @returns {void}
 *
 * @example
 * updateContactBtnListener(editFormElement, contactId);
 */
export function updateContactBtnListener(editContactInput, contactId) {
    const changeBtn = editContactInput.querySelector('#change_contact_btn_id');
    if (changeBtn) {
        let contactIdent = contactsList[contactId].id;
        changeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const updatedContact = {
                name: document.getElementById('contact_name_id').value,
                email: document.getElementById('contact_email_id').value,
                phone: document.getElementById('contact_phone_id').value,
                color: document.getElementById('contact_color_picker_id').value,
            };
            updateContactInList(contactIdent, updatedContact);
        });
    }
}


/**
 * Updates a contact with the given data, both remotely and in the local application state.
 * Persists the updated contact via `updateContact`, re-fetches the updated contact data,
 * replaces the corresponding entry in the global `contactsList`, updates the contact's
 * representation in the DOM, closes the edit dialog, and reopens the single contact view.
 *
 * @async
 * @param {string|number} contactId - The ID of the contact to be updated.
 * @param {Object} updatedContact - The new contact data to be saved (e.g. name, email, phone, color).
 * @returns {Promise<void>}
 *
 * @example
 * await updateContactInList(contact.id, { name: 'John Doe', email: 'john@example.com', phone: '123456', color: '#FF5733' });
 */
async function updateContactInList(contactId, updatedContact) {
    await updateContact(contactId, updatedContact);
    const contactNumber = searchIndex(contactId);
    let changedContact = await getContact(contactId);
    contactsList[contactNumber] = changedContact;
    changeContactInDom(contactId, changedContact);
    closeAddContactDialog();
    openSingleViewContact(contactId);
}


/**
 * Updates the DOM representation of a contact list item with the given contact's
 * current data. Updates the displayed name, email, avatar initials, and avatar color
 * of the corresponding list entry.
 *
 * @param {string|number} contactId - The ID of the contact whose list item should be updated.
 * @param {Object} changedContact - The updated contact data containing `name`, `email`, `shortName`, and `color`.
 * @returns {void}
 *
 * @example
 * changeContactInDom(contact.id, updatedContact);
 */
function changeContactInDom(contactId, changedContact) {
    const button = document.getElementById('contact_id_' + contactId);
    button.querySelector('h4').textContent = changedContact.name;
    button.querySelector('p').textContent = changedContact.email;
    button.querySelector('.contacts_list_name_symbol').textContent = changedContact.shortName;
    button
        .querySelector('.contacts_list_name_symbol')
        .style.setProperty('--contact-color', changedContact.color);
}


/**
 * Opens the delete confirmation dialog for a given contact.
 * Displays the dialog as a modal, sets the contact's name in the dialog's text,
 * and registers the necessary event listeners for the confirm and cancel buttons.
 *
 * @param {string|number} contactId - The ID of the contact to be deleted.
 * @param {string} person - The name of the contact to be displayed in the confirmation message.
 * @returns {void}
 *
 * @example
 * deleteContactDialog(contact.id, contact.name);
 */
export function deleteContactDialog(contactId, person) {
    const deleteDialog = document.getElementById('contact_dialog_delete_id');
    deleteDialog.showModal();
    const userNameSpan = deleteDialog.querySelector('#user_name_id');
    userNameSpan.textContent = '';
    userNameSpan.textContent = person;
    const deleteButton = deleteDialog.querySelector('button:first-of-type');
    const cancelButton = deleteDialog.querySelector('button:last-of-type');
    eventListenerDeleteContactDialog(contactId, deleteButton, cancelButton, deleteDialog);
}

/**
 * Registers the click event listeners for the delete confirmation dialog's action buttons.
 * On confirm, deletes the contact remotely, removes it from the DOM, closes the delete
 * dialog, and also closes the contact edit dialog if it is currently open.
 * On cancel, simply closes the delete dialog without further action.
 *
 * @param {string|number} contactId - The ID of the contact to be deleted.
 * @param {HTMLElement} deleteButton - The button element that confirms the deletion.
 * @param {HTMLElement} cancelButton - The button element that cancels the deletion.
 * @param {HTMLDialogElement} deleteDialog - The dialog element to be closed after confirm or cancel.
 * @returns {void}
 *
 * @example
 * eventListenerDeleteContactDialog(contact.id, confirmBtn, cancelBtn, dialogElement);
 */
function eventListenerDeleteContactDialog(contactId, deleteButton, cancelButton, deleteDialog) {
    deleteButton.addEventListener('click', async () => {
        await deleteContact(contactId);
        removeContactFromDom(contactId);
        deleteDialog.close();
        if (contactDialog.open) {
            contactDialog.close();
        }
    });
    cancelButton.addEventListener('click', () => {
        deleteDialog.close();
    });
}

/**
 * Removes a contact from the local application state and refreshes the contact list UI.
 * Finds the contact's index in the global `contactsList` and removes it, clears the
 * rendered contact list from the DOM, rebuilds the letter separators, and opens the
 * single view of the first remaining contact.
 *
 * @param {string|number} contactId - The ID of the contact to be removed.
 * @returns {void}
 *
 * @example
 * removeContactFromDom(contact.id);
 */
function removeContactFromDom(contactId) {
    const indexContact = searchIndex(contactId);
    contactsList.splice(indexContact, 1);
    removeContactListFromDom();
    getFirstLetterForSeperator();
    const firstContactListItem = seperatIdFromContactList();
    openSingleViewContact(firstContactListItem);
}

/**
 * Opens the add contact dialog and initializes it for creating a new contact.
 * Displays the dialog as a modal, switches the dialog header to the "add" state,
 * appends the header underline decoration, opens the empty edit form, and
 * registers the event listeners for the color picker and the dialog's action buttons.
 *
 * @returns {void}
 *
 * @example
 * openAddContactDialog();
 */
function openAddContactDialog() {
    contactDialog.showModal();
    contactDialogHeaderSwitch();
    contactDialogHeader.appendChild(renderUnderlineHeaderContactDialog());
    openEditInput();
    startEventListenerColorPicker();
    startEventListenersAddContactDialog();
}


/**
 * Registers an input event listener on the color picker element inside the contact form.
 * Updates the `--contact-color` CSS custom property on the picker's parent element
 * in real time to reflect the currently selected color.
 *
 * @returns {void}
 *
 * @example
 * startEventListenerColorPicker();
 */
function startEventListenerColorPicker() {
    document.getElementById('contact_color_picker_id').addEventListener('input', (event) => {
        event.target.parentElement.style.setProperty('--contact-color', event.target.value);
    });
}


/**
 * Registers a blur event listener on the contact name input field inside the add contact dialog.
 * If a name has been entered, derives the initials from the input value and updates the
 * avatar preview to display them. If the field is left empty, resets the avatar preview
 * to its default state.
 *
 * @returns {void}
 *
 * @example
 * startEventListenersAddContactDialog();
 */
function startEventListenersAddContactDialog() {
    document.getElementById('contact_name_id').addEventListener('blur', (event) => {
        if (event.target.value != '') {
            let showFirstLetters = contactListInitials(event.target.value);
            changeImgToInitials(showFirstLetters);
        } else {
            resetPersonInitials();
        }
    });
}

/**
 * Derives up to two-letter initials from a given full name.
 * Splits the name into words, takes the first two words, and returns their
 * uppercased first letters joined together.
 *
 * @param {string} contactListName - The full name from which to derive the initials.
 * @returns {string} The uppercased initials (up to two letters).
 *
 * @example
 * const initials = contactListInitials('John Doe'); // 'JD'
 */
function contactListInitials(contactListName) {
    let initials = contactListName
        .split(' ')
        .splice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
    return initials;
}

/**
 * Updates the contact avatar preview to display the given initials instead of the
 * default person icon. If the initials element already exists in the DOM, updates
 * its text content directly; otherwise replaces the default icon element with a
 * newly rendered initials element.
 *
 * @param {string} initials - The initials to be displayed in the avatar preview.
 * @returns {void}
 *
 * @example
 * changeImgToInitials('JD');
 */
function changeImgToInitials(initials) {
    let imgElement = document.getElementById('person_icon_id');
    if (imgElement === null) {
        document.getElementById('person_initials_id').textContent = initials;
        return;
    }
    let initialsElement = renderPersonInitialsForAddContact(initials);
    imgElement.replaceWith(initialsElement);
}

/**
 * Resets the contact avatar preview back to the default person icon.
 * If no initials element is currently present in the DOM, does nothing.
 * Otherwise creates a new default person icon image element and replaces
 * the initials element with it.
 *
 * @returns {void}
 *
 * @example
 * resetPersonInitials();
 */
function resetPersonInitials() {
    let initialsElement = document.getElementById('person_initials_id');
    if (initialsElement === null) {
        return;
    }
    let imgElement = document.createElement('img');
    imgElement.id = 'person_icon_id';
    imgElement.src = 'assets/img/person64x64.webp';
    imgElement.alt = 'Person Icon';
    initialsElement.replaceWith(imgElement);
}

/**
 * Closes the add/edit contact dialog and resets its state for the next use.
 * Resets the global `--contact-color` CSS custom property to its default value,
 * clears all input field values, resets the avatar preview to the default icon,
 * and closes the dialog.
 *
 * @returns {void}
 *
 * @example
 * closeAddContactDialog();
 */
function closeAddContactDialog() {
    document.documentElement.style.setProperty('--contact-color', DEFAULT_CONTACT_COLOR);
    deleteInputValues();
    resetPersonInitials();
    contactDialog.close();
}

/**
 * Clears all input fields within the contact form and resets the global
 * `--contact-color` CSS custom property to its default value.
 *
 * @returns {void}
 *
 * @example
 * deleteInputValues();
 */
function deleteInputValues() {
    const form = document.querySelector("#contact_form_id");
    form.querySelectorAll("input").forEach(input => {
    input.value = "";
    });
    document.documentElement.style.setProperty('--contact-color', DEFAULT_CONTACT_COLOR);
}

/**
 * Reads the current values from the contact form's input fields, derives the
 * contact's initials from the entered name, assembles a new contact object,
 * and passes it to `writeNewContact` for persistence.
 *
 * @returns {void}
 *
 * @example
 * getNewContactValues();
 */
function getNewContactValues() {
    let contact = {
        name: document.getElementById('contact_name_id').value,
        email: document.getElementById('contact_email_id').value,
        phone: document.getElementById('contact_phone_id').value,
        color: document.getElementById('contact_color_picker_id').value,
        shortName: contactListInitials(document.getElementById('contact_name_id').value),
    };
    writeNewContact(contact);
}

/**
 * Persists a new contact and refreshes the contact list UI accordingly.
 * Creates the contact remotely, re-fetches the updated contacts list, determines
 * the ID of the newly created contact, rebuilds the rendered contact list and its
 * letter separators, closes the add contact dialog, shows a success confirmation,
 * and opens the single view of the newly created contact. Logs an error to the
 * console if any step fails.
 *
 * @async
 * @param {Object} contact - The new contact data to be saved (e.g. name, email, phone, color, shortName).
 * @returns {Promise<void>}
 *
 * @example
 * await writeNewContact({ name: 'John Doe', email: 'john@example.com', phone: '123456', color: '#FF5733', shortName: 'JD' });
 */
async function writeNewContact(contact) {
    try {
        await createContact(contact);
        await getContactsAfterCreation();
        let newContactId = idNewContact();
        removeContactListFromDom();
        getFirstLetterForSeperator();
        closeAddContactDialog();
        contactSuccessfullyCreatedDialog();
        openSingleViewContact(newContactId);
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
    }
}

/**
 * Re-fetches the full contacts list from the backend and updates the global
 * `contactsList` after a new contact has been created. Logs an error to the
 * console if the fetch fails.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * await getContactsAfterCreation();
 */
async function getContactsAfterCreation() {
    try {
        contactsList = await getContacts();
    } catch (error) {
        console.error('Fehler beim Abrufen der Kontakte:', error);
    }
}

/**
 * Retrieves the ID of the recently added contact from the global `contactsList`.
 * Assumes the newest contact is the last entry in the list.
 *
 * @returns {string|number} The ID of the last contact in `contactsList`.
 *
 * @example
 * const newId = idNewContact();
 */
function idNewContact() {
    const newContactId = contactsList[contactsList.length - 1].id;
    return newContactId;
}

/**
 * Removes all rendered contact list items and letter separator elements from the DOM,
 * clearing the contact list container for a fresh re-render.
 *
 * @returns {void}
 *
 * @example
 * removeContactListFromDom();
 */
function removeContactListFromDom() {
    const contactListElements = document.querySelectorAll(
        '.contacts_list_items_container, .contacts_list_letter_seperator'
    );
    contactListElements.forEach((element) => {
        element.remove();
    });
}

/**
 * Displays a temporary success confirmation dialog after a contact has been created.
 * Shows the dialog as a modal and automatically closes it again after 2 seconds.
 *
 * @returns {void}
 *
 * @example
 * contactSuccessfullyCreatedDialog();
 */
function contactSuccessfullyCreatedDialog() {
    const successDialog = document.getElementById('contact_dialog_success_id');
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
    }, SUCCESS_DIALOG_TIMEOUT);
}

/**
 * Opens the contact dialog in edit mode for a given contact.
 * Displays the dialog as a modal, switches the dialog header to the "edit" state,
 * populates the form with the existing contact's data, and registers the
 * event listener for the color picker.
 *
 * @param {string|number} id - The ID of the contact to be edited.
 * @returns {void}
 *
 * @example
 * openEditContactDialog(contact.id);
 */
export function openEditContactDialog(id) {
    contactDialog.showModal();
    contactDialogHeaderSwitch(true);
    openEditInput('edit', id);
    startEventListenerColorPicker();
}

/**
 * Switches the contact dialog's header content between the "add" and "edit" states.
 * Clears the current header content and re-renders it based on the given state.
 *
 * @param {boolean} [state] - Whether the dialog is in edit mode (`true`) or add mode (`false`/`undefined`).
 * @returns {void}
 *
 * @example
 * contactDialogHeaderSwitch(true); // edit mode
 * contactDialogHeaderSwitch(); // add mode
 */
export function contactDialogHeaderSwitch(state) {
    contactDialogHeader.innerHTML = '';
    contactDialogHeader.appendChild(renderAddOrEditContactDialog(state));
}

/**
 * Renders the contact input form into the dialog, for either the add or edit mode.
 * Removes any existing input form to avoid duplicates, resolves the contact's index
 * in `contactsList` when an ID is provided, and appends the newly rendered form
 * to the edit contact input container.
 *
 * @param {string} [mode] - The form mode, e.g. `'edit'` or `undefined`/other value for add mode.
 * @param {string|number} [id] - The ID of the contact to be edited. Omit when creating a new contact.
 * @returns {void}
 *
 * @example
 * openEditInput('edit', contact.id);
 * openEditInput(); // add mode
 */
function openEditInput(mode, id) {
    const existingInput = document.getElementById('contact_input_id');
    if (existingInput) {
        existingInput.remove();
    }
    let contactId = undefined;
    if (id !== undefined) {
        contactId = searchIndex(id);
    }
    editContactInputContainer.appendChild(renderContactInput(mode, contactId));
}

/**
 * Extracts the contact ID from the first contact list item element currently
 * rendered in the DOM, by removing the `'contact_id_'` prefix from its element ID.
 *
 * @returns {string} The extracted ID of the first contact in the list.
 *
 * @example
 * const firstId = seperatIdFromContactList();
 */
function seperatIdFromContactList() {
    const firstContactListItem = document.querySelector('.contacts_list_items_container');
    const contactId = firstContactListItem.id.replace('contact_id_', '');
    return contactId;
}
