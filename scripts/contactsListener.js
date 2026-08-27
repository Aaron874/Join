import {
    openAddContactDialog,
    getNewContactValues,
    openEditContactDialog,
    openEditOrDeleteMenuMobile,
    closeAddContactDialog,
    changeImgToInitials,
    contactListInitials,
    resetPersonInitials,
} from './contactsAddandEdit.js';
import {
    MOBILE_BREAKPOINT,
    deleteContactDialog,
    searchIndex,
    switchListToSingleViewAndBack,
    openSingleViewContact,
    updateContactInList,
    contactsList
} from './contacts.js';
import { resetListAndSingleViewVisibility } from './contactListBuilder.js';

const DESKTOP_BREAKPOINT = 702;
const desktopMediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

/**
 * Registers a global click event listener that handles elements with a
 * `data-action` attribute. Opens the add contact dialog for the
 * `'open_dialog_contact'` action, or closes it for the `'close_dialog_contact'`
 * action.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
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

/**
 * Registers a global submit event listener for the contact form. Prevents the
 * default form submission and, when the submitter's `data-action` is
 * `'create_contact'`, reads the entered contact values and creates a new
 * contact. Currently has no effect for the `'update_contact'` action.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
document.addEventListener('submit', (event) => {
    if (!event.target.matches('#contact_form_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'create_contact':
            getNewContactValues();
            break;
    }
});

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
export function startEventListenerColorPicker() {
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
export function startEventListenersAddContactDialog() {
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
    let screenSize = window.innerWidth;
    let editButton;
    if (screenSize < MOBILE_BREAKPOINT) {
        editButton = newSingleView.querySelector('#mobile_edit_btn_id');
    } else {
        editButton = newSingleView.querySelector('#edit_btn_id');
    }
    editButton.addEventListener('click', (e) => {
        if (screenSize < MOBILE_BREAKPOINT) {
            openEditOrDeleteMenuMobile(id, e);
        } else {
            openEditContactDialog(id);
        }
    });
}

/**
 * Sets up click listener for the mobile edit/delete menu (edit, delete, or close on outside click).
 * @param {string|number} id - Contact ID.
 * @param {HTMLElement} mobileEditContainer - Menu container element.
 */
export function listenerMobileEditMenu(id, mobileEditContainer) {
    const controller = new AbortController();
    const { signal } = controller;
    document.addEventListener(
        'click',
        (e) => {
            if (!mobileEditContainer.contains(e.target)) {
                closeAndCleanup();
                return;
            }
            if (e.target.closest('#edit_mobile_btn_id')) {
                openEditContactDialog(id);
            }
            if (e.target.closest('#delete_mobile_btn_id')) {
                deleteContactDialog(id, contactsList[searchIndex(id)].name);
                closeAndCleanup();
            }
        },
        { signal }
    );
    function closeAndCleanup() {
        mobileEditContainer.classList.remove('open');
        controller.abort();
    }
}






/**
 * Registers a click listener on the delete button of the single contact view,
 * but only above the mobile breakpoint (button not available on mobile).
 * Opens the delete confirmation dialog for the contact when clicked.
 *
 * @param {HTMLElement} newSingleView - The single contact view element containing the button.
 * @param {string|number} id - The ID of the contact to be deleted.
 * @param {Object} person - The contact data passed to the delete dialog.
 * @returns {void}
 *
 * @example
 * openDeleteDialogBtnListener(singleViewElement, contact.id, contact);
 */
export function openDeleteDialogBtnListener(newSingleView, id, person) {
    let screenSize = window.innerWidth;
    if (screenSize > MOBILE_BREAKPOINT) {
        const deleteButton = newSingleView.querySelector('#delete_btn_id');
        deleteButton.addEventListener('click', () => {
            deleteContactDialog(id, person);
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
export function returnToListBtnListener(newSingleView) {
    const returnToListBtn = newSingleView.querySelector('#mobile_back_btn_id');
    returnToListBtn.addEventListener('click', () => {
        switchListToSingleViewAndBack();
    });
}

/**
 * Registers a click listener on the delete button in the edit contact form
 * that opens the delete confirmation dialog for the contact.
 *
 * @param {string|number} contactId - Index/key to look up the contact in `contactsList`.
 * @param {Object} person - The contact data passed to the delete dialog.
 * @param {HTMLElement} editContactInput - The edit contact form element containing the button.
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
 * Listens for changes to the desktop media query and resets the list/single
 * view visibility classes once the viewport matches the desktop breakpoint.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
desktopMediaQuery.addEventListener('change', (event) => {
    if (event.matches) {
        resetListAndSingleViewVisibility();
    }
});
