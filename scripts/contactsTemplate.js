
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
                  <button onclick="openEditContactDialog('${shortName}', '${person}', '${email}', '${color}', '${phone}')">
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

function renderEditContactInput(shortName, person, email, color, phone) {
  let editContactInput = document.createElement("div");
  editContactInput.classList.add("add_contact_form_container");
  editContactInput.innerHTML = `
            <label class="add_contact_color_picker" style="--contact-color: ${color};">
              <input
                type="color"
                name="background_color"
                id="edit_contact_color_picker_id"
                value="${color}"
              />
              <img id="person_icon_id" src="assets/img/person64x64.webp" alt="Person Icon" />
            </label>
            <form action="" method="post" id="add_contact_form_id">
              <div class="add_contact_input_wrapper">
                <input
                  class="add_contact_input"
                  type="text"
                  value="${person}"
                  name="name"
                  id="add_contact_name_id"
                  placeholder="Name"
                  required
                />
                <img src="assets/img/person24x24.webp" alt="Person Icon" />
              </div>
              <div class="add_contact_input_wrapper">
                <input type="text" name="email" id="add_contact_email_id" placeholder="E-Mail" value="${email}" required/>
                <img src="assets/img/mail.webp" alt="E-Mail Icon" />
              </div>
              <div class="add_contact_input_wrapper">
                <input type="text" name="phone" id="add_contact_phone_id" placeholder="Phone" value="${phone}" required/>
                <img src="assets/img/call.webp" alt="Phone Icon" />
              </div>
              <div class="add_contact_btn_container">
                <button
                  class="edit_contact_btn_cancel"
                  type="reset"
                  onclick="closeEditContactDialog()"
                >
                  Delete
                </button>
                <button class="add_contact_btn_submit" type="submit">
                  Save
                  <span
                    ><img src="assets/img/check.webp" alt="Check Icon"
                  /></span>
                </button>
              </div>
            </form>
`
return editContactInput;
}
