const SUPABASE_URL = "https://vnutrvpsvqoveihpgibm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Kw-0YWYsqSdL07CMlgyoUg_RIrB4-Ff";
const form = document.querySelector("#registration");
const submitButton = document.querySelector("#submit-button");
const dateOfBirth = document.querySelector("#date-of-birth");

initDateOfBirth();
form.addEventListener("focusout", focusOut);

// const supabaseClient = supabase.createClient({
//     SUPABASE_URL,
//     SUPABASE_PUBLISHABLE_KEY,
// });

function focusOut(event) {
    if (!event.target.matches(".form-input")) {
        return;
    }

    const id = event.target.id;
    const elementFunctions = {
        "first-name": firstNameValidation,
        "last-name": lastNameValidation,
        "date-of-birth": dateOfBirthValidation,
        "city": cityValidation,
        "email": emailValidation,
        "invitation": invitationValidation,
    }

    if (event.target.required) {
        elementFunctions[id](event.target);
    }
}

function firstNameValidation(element) {
    // Validace dle definice HTML atributů
    if (!element.checkValidity()) {
        return;
    }

    const value = element.value;
}

function initDateOfBirth() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 10);

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    dateOfBirth.max = `${yyyy}-${mm}-${dd}`;
}