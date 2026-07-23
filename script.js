const SUPABASE_URL = "https://vnutrvpsvqoveihpgibm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Kw-0YWYsqSdL07CMlgyoUg_RIrB4-Ff";
const form = document.querySelector("#registration");
const submitButton = document.querySelector("#submit-button");
const dateOfBirth = document.querySelector("#date-of-birth");

// Pole, kterých se už uživatel dotkl (opustil je) – u nich validujeme i při psaní.
const touched = new Set();

// Validátory jednotlivých polí. Vrací chybovou hlášku (string) nebo "" když je pole v pořádku.
// Pořadí odpovídá pořadí v DOM, takže validateAll() ohlásí první chybu odshora.
const VALIDATORS = {
    "first-name": validateFirstName,
    "last-name": validateLastName,
    "date-of-birth": validateDateOfBirth,
    "city": validateCity,
    "email": validateEmail,
    "invitation": validateInvitation,
};

// Vypneme nativní validaci prohlížeče – jinak by zablokoval odeslání dřív,
// než se spustí náš submit handler (a naše chybové ikony by se neukázaly).
// Atributy required/min/max zůstávají kvůli :user-invalid stylům podtržení.
form.noValidate = true;

initDateOfBirth();
initErrorMarkers();

form.addEventListener("focusout", onFocusOut);
form.addEventListener("input", onLiveInput);
form.addEventListener("change", onLiveInput);
form.addEventListener("submit", onSubmit);
form.addEventListener("click", onErrorIconClick);
form.addEventListener("keydown", onErrorIconKeydown);
// Přepočítá pozici viditelných značek, když se změní rozměry (fonty, resize).
window.addEventListener("resize", repositionVisibleMarkers);
window.addEventListener("load", repositionVisibleMarkers);

// const supabaseClient = supabase.createClient({
//     SUPABASE_URL,
//     SUPABASE_PUBLISHABLE_KEY,
// });

/* -------------------------------------------------------------------------- */
/*  Události                                                                   */
/* -------------------------------------------------------------------------- */

function onFocusOut(event) {
    const id = event.target.id;
    if (!VALIDATORS[id]) {
        return;
    }
    // Pole je "dotčené" – od teď validujeme průběžně i při psaní.
    touched.add(id);
    validateField(event.target);
}

function onLiveInput(event) {
    const id = event.target.id;
    if (!VALIDATORS[id] || !touched.has(id)) {
        return;
    }
    validateField(event.target);
}

// Klik na ikonu přepne tooltip mezi otevřeno / zavřeno.
function onErrorIconClick(event) {
    const icon = event.target.closest(".field-error__icon");
    if (!icon) {
        return;
    }
    icon.closest(".field-error").classList.toggle("is-open");
}

// Totéž z klávesnice (Enter / mezerník) kvůli přístupnosti.
function onErrorIconKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }
    const icon = event.target.closest(".field-error__icon");
    if (!icon) {
        return;
    }
    event.preventDefault();
    icon.closest(".field-error").classList.toggle("is-open");
}

function onSubmit(event) {
    event.preventDefault();

    const firstInvalid = validateAll();
    if (firstInvalid) {
        firstInvalid.focus();
        return;
    }

    const data = collectFormData();

    console.log("Formulář je validní. Odesílám data:", data);

    setLoadingState(true);
    try {
        //await sendRegistration(data);
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("Registrace proběhla úspěšně.");
    } finally {
        setLoadingState(false);
    }
}

/* -------------------------------------------------------------------------- */
/*  Validace                                                                   */
/* -------------------------------------------------------------------------- */

// Zvaliduje jedno pole, zobrazí / skryje chybovou značku a vrátí true když je v pořádku.
function validateField(element) {
    const message = VALIDATORS[element.id](element);
    if (message) {
        showError(element, message);
        return false;
    }
    clearError(element);
    return true;
}

// Zvaliduje všechna pole a vrátí první neplatný element (nebo null když je vše OK).
function validateAll() {
    let firstInvalid = null;
    for (const id of Object.keys(VALIDATORS)) {
        const element = document.getElementById(id);
        touched.add(id);
        if (!validateField(element) && !firstInvalid) {
            firstInvalid = element;
        }
    }
    return firstInvalid;
}

function validateFirstName(element) {
    const value = element.value.trim();
    if (!value) {
        return "Zadejte prosím jméno.";
    }
    if (value.length > 255) {
        return "Jméno může mít maximálně 255 znaků.";
    }
    return "";
}

function validateLastName(element) {
    const value = element.value.trim();
    if (!value) {
        return "Zadejte prosím příjmení.";
    }
    if (value.length > 255) {
        return "Příjmení může mít maximálně 255 znaků.";
    }
    return "";
}

function validateCity(element) {
    const value = element.value.trim();
    if (!value) {
        return "Zadejte prosím město.";
    }
    if (value.length > 255) {
        return "Město může mít maximálně 255 znaků.";
    }
    return "";
}

function validateEmail(element) {
    const value = element.value.trim();
    if (!value) {
        return "Zadejte prosím e-mail.";
    }
    if (value.length < 5 || value.length > 254) {
        return "E-mail musí mít 5 až 254 znaků.";
    }
    // Jednoduchý formát: neprázdná lokální část @ doména s tečkou.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Zadejte platnou e-mailovou adresu.";
    }
    return "";
}

function validateDateOfBirth(element) {
    const value = element.value; // "" nebo "yyyy-mm-dd"
    if (!value) {
        return "Zadejte prosím datum narození.";
    }
    // Ověření, že jde o reálné datum (např. ne 2023-02-30).
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return "Zadejte platné datum narození.";
    }
    // ISO řetězce (yyyy-mm-dd) jde porovnávat lexikograficky.
    if (element.max && value > element.max) {
        return "Pro registraci musí být věk alespoň 10 let.";
    }
    if (element.min && value < element.min) {
        return "Zadejte platné datum narození.";
    }
    return "";
}

function validateInvitation(element) {
    if (!element.value) {
        return "Vyberte prosím, kdo vás pozval.";
    }
    return "";
}

/* -------------------------------------------------------------------------- */
/*  Sběr dat                                                                   */
/* -------------------------------------------------------------------------- */

function collectFormData() {
    return {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        dateOfBirth: dateOfBirth.value, // "yyyy-mm-dd"
        city: form.city.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        invitation: Number(form.invitation.value),
        newsletter: form.newsletter.checked,
    };
}

/* -------------------------------------------------------------------------- */
/*  Chybové značky + tooltipy                                                  */
/* -------------------------------------------------------------------------- */

// Ke každému validovanému poli vytvoří skrytou červenou značku s tooltipem.
function initErrorMarkers() {
    for (const id of Object.keys(VALIDATORS)) {
        const element = document.getElementById(id);
        if (!element) {
            continue;
        }

        const marker = document.createElement("div");
        marker.className = "field-error";
        // U selectu / date inputu odsadíme značku, aby nepřekrývala nativní ovládání.
        if (element.tagName === "SELECT") {
            marker.classList.add("field-error--offset");
        }

        const tooltipId = `${id}-error`;
        marker.innerHTML = `
            <span class="field-error__icon" tabindex="0" role="img" aria-label="Chyba">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M12 2.6a1.7 1.7 0 0 1 1.48.86l8.05 14.02A1.7 1.7 0 0 1 20.05 20H3.95a1.7 1.7 0 0 1-1.48-2.52L10.52 3.46A1.7 1.7 0 0 1 12 2.6Z" fill="#e2455a"/>
                    <rect x="11" y="8" width="2" height="6" rx="1" fill="#fff"/>
                    <circle cx="12" cy="16.4" r="1.15" fill="#fff"/>
                </svg>
            </span>
            <span class="field-error__tooltip" id="${tooltipId}" role="tooltip"></span>
        `;

        element.parentElement.appendChild(marker);
        element.setAttribute("aria-describedby", tooltipId);
    }
}

function showError(element, message) {
    const marker = element.parentElement.querySelector(".field-error");
    if (!marker) {
        return;
    }
    marker.querySelector(".field-error__tooltip").textContent = message;

    // Značku svisle vycentrujeme přesně na pole (výška se liší u date/select).
    positionMarker(element, marker);

    // is-visible = zobrazí ikonu. Tooltip otevřeme automaticky jen když se chyba
    // objeví poprvé – ať nepřebíjíme ruční zavření uživatelem při dalším psaní.
    const firstTime = !marker.classList.contains("is-visible");
    marker.classList.add("is-visible");
    if (firstTime) {
        marker.classList.add("is-open");
    }
    element.setAttribute("aria-invalid", "true");
}

function clearError(element) {
    const marker = element.parentElement.querySelector(".field-error");
    if (!marker) {
        return;
    }
    marker.classList.remove("is-visible", "is-open");
    element.removeAttribute("aria-invalid");
}

// Napozicuje značku přesně přes box pole (kontejner je offsetParent).
function positionMarker(element, marker) {
    marker.style.top = `${element.offsetTop}px`;
    marker.style.height = `${element.offsetHeight}px`;
}

function repositionVisibleMarkers() {
    for (const id of Object.keys(VALIDATORS)) {
        const element = document.getElementById(id);
        const marker = element.parentElement.querySelector(".field-error.is-visible");
        if (marker) {
            positionMarker(element, marker);
        }
    }
}

/* -------------------------------------------------------------------------- */
/*  Datum narození – horní hranice (min. věk 10 let)                           */
/* -------------------------------------------------------------------------- */

function initDateOfBirth() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 10);

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    dateOfBirth.max = `${yyyy}-${mm}-${dd}`;
}

function setLoadingState(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.innerHTML;

        submitButton.innerHTML = `
            <span class="loading-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><title xmlns="">loading-alt-loop</title><g fill="currentColor"><circle cx="12" cy="3.5" r="1.5"><animate attributeName="fill-opacity" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="16.25" cy="4.64" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="0.2s" to="1"/><animate attributeName="fill-opacity" begin="0.2s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="19.36" cy="7.75" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="0.4s" to="1"/><animate attributeName="fill-opacity" begin="0.4s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="20.5" cy="12" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="0.6s" to="1"/><animate attributeName="fill-opacity" begin="0.6s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="19.36" cy="16.25" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="0.8s" to="1"/><animate attributeName="fill-opacity" begin="0.8s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="16.25" cy="19.36" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="1s" to="1"/><animate attributeName="fill-opacity" begin="1s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="12" cy="20.5" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="1.2s" to="1"/><animate attributeName="fill-opacity" begin="1.2s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="7.75" cy="19.36" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="1.4s" to="1"/><animate attributeName="fill-opacity" begin="1.4s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="4.64" cy="16.25" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="1.6s" to="1"/><animate attributeName="fill-opacity" begin="1.6s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="3.5" cy="12" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="1.8s" to="1"/><animate attributeName="fill-opacity" begin="1.8s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="4.64" cy="7.75" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="2s" to="1"/><animate attributeName="fill-opacity" begin="2s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle><circle cx="7.75" cy="4.64" r="1.5" opacity="0"><set fill="freeze" attributeName="opacity" begin="2.2s" to="1"/><animate attributeName="fill-opacity" begin="2.2s" dur="2.4s" keyTimes="0;0.125;0.25;1" repeatCount="indefinite" values="1;1;0;0"/></circle></g></svg>
            </span>
        `;
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.dataset.originalText || "REGISTROVAT SE";
    }
}

async function sendRegistration(data) {

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    console.log("Backend odpověď:", result);
}