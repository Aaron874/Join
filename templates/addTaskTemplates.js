/**
 * Create the HTML markup for a single contact item in the contacts dropdown.
 *
 * @param {string} contactName - The full name of the contact.
 * @param {string} color - The contact color used for the initials badge.
 * @param {string} shortName - The initials or short label shown in the badge.
 * @param {Array<{name: string}>} selectedContacts - Currently selected contacts.
 * @returns {string} HTML string for the contact checkbox entry.
 */
export function contactsTemplate(
    contactName,
    color,
    shortName,
    selectedContacts
) {
    const checked = selectedContacts.some(
        contact => contact.name.trim() === contactName.trim()
    );
    return `
        <label class="contacts_div">
            <div class="contacts_dropdown_initials-plus-name_style">
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
                <span>${contactName}</span>
            </div>
            <input class="contacts_input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleContact('${contactName}', '${shortName}', '${color}')"/>
        </label>`;
}

/**
 * Create the HTML markup for a selected contact initials badge.
 *
 * @param {string} shortName - The initials or short label shown in the badge.
 * @param {string} color - The contact color used for the badge background.
 * @returns {string} HTML string for the selected contact badge.
 */
export function templateSelectedContacts(shortName, color) {
    return `<div>
    <div>
        <div class="contacts_list_name_symbol"
            style="--contact-color: ${color};">
            ${shortName}
        </div>
    </div>
    </div>`;
}

export function templatePlusSymbole(hiddenCount) {
    return `
        <div class="your_element">
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 4.5V19.5"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                />
                <path
                    d="M4.5 12H19.5"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                />
            </svg>
            <span class="hidden-contacts-count">${hiddenCount}</span>
        </div>
    `;

}

window.templatePlusSymbole = templatePlusSymbole;