
function renderContactsList(Letter) {
    return `
     <div class="contacts_list_letter_seperator" data-letter="${Letter}">${Letter}</div>`
}

function renderContactsListItems(shortName, person, email, color = "#BDBDBD") {
    let newContact = document.createElement("button");
    newContact.classList.add("contacts_list_items_container");
    newContact.innerHTML = `
          <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
          <div>
            <h4>${person}</h4>
            <p><a href="mailto:${email}"></a>${email}</p>
          </div>
          `
        return newContact;
}