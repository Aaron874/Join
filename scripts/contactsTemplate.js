
function renderContactsList(Letter) {
    return `
     <div class="contacts_list_letter_seperator" data-letter="${Letter}">${Letter}</div>`
}

function renderContactsListItems(shortName, person, email, color = "#BDBDBD", phone) {
    let newContact = document.createElement("button");
    newContact.classList.add("contacts_list_items_container");
    newContact.innerHTML = `
          <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
          <div>
            <h4>${person}</h4>
            <p><a href="mailto:${email}"></a>${email}</p>
          </div>
          `;
          newContact.addEventListener("click", () => {
            openSingleViewContact(shortName, person, email, color, phone);
          });
        return newContact;
}


function renderSingleContactView(shortName, person, email, color = "#BDBDBD", phone = "No phone number") {
    let newSingleView = document.createElement("div");
    newSingleView.innerHTML = `
            <div class="contacts_single_view_content_header">
              <div class="contacts_icon" style="--contact-color: ${color};" >${shortName}</div>
              <div>
                <h3 class="contacts_single_view_name">${person}</h3>
                <div class="contacts_single_view_actions">
                  <button>
                    <img src="assets/img/edit.webp" alt="Edit Contact" />Edit
                  </button>
                  <button>
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
    return newSingleView;
}

function renderPersonInitialsForAddContact(initials) {
  let personInitials = document.createElement("span");
  personInitials.classList.add("person_initials");
  personInitials.id = "person_initials_id";
  personInitials.textContent = initials;
  return personInitials;
}

