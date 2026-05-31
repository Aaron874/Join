
function renderContactsList(Letter) {
    return `
     <div class="contacts_list_letter_seperator">${Letter}</div>`
}

function renderContactsListItems(shortName, person, email) {
    return `
        <button class="contacts_list_items_container">
          <div class="contacts_list_name_symbol" >${shortName}</div>
          <div>
            <h4>${person}</h4>
            <p><a href="mailto:${email}"></a>${email}</p>
          </div>
        </button>`
}