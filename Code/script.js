/* =========================
   LOAD HEADER, FOOTER & MODAL
========================= */

document.addEventListener("DOMContentLoaded", function () {
  loadHeaderAndFooter();
  loadOfferModal();
});


function loadHeaderAndFooter() {
  fetch("components/header-and-footer.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      const temp = document.createElement("div");
      temp.innerHTML = data;

      const header = temp.querySelector("header");
      const footer = temp.querySelector("footer");

      const siteHeader = document.getElementById("site-header");
      const siteFooter = document.getElementById("site-footer");

      if (header && siteHeader) {
        siteHeader.innerHTML = header.outerHTML;
      }

      if (footer && siteFooter) {
        siteFooter.innerHTML = footer.outerHTML;
      }
    })
    .catch(function (error) {
      console.log("Header/Footer konnte nicht geladen werden:", error);
    });
}


function loadOfferModal() {
  const modalPlace = document.getElementById("site-offer-modal");

  if (!modalPlace) return;

  fetch("components/angebot-modal.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      modalPlace.innerHTML = data;

      setupOfferFormValidation();
    })
    .catch(function (error) {
      console.log("Angebot Modal konnte nicht geladen werden:", error);
    });
}


/* =========================
   MOBILE MENU
========================= */

function toggleMenu() {
  const nav = document.getElementById("nav");

  if (nav) {
    nav.classList.toggle("open");
  }
}


/* =========================
   DROPDOWN DIENSTLEISTUNGEN
========================= */

function toggleServiceDropdown(event) {
  if (event) {
    event.stopPropagation();
  }

  const dropdown = document.querySelector(".nav-dropdown");

  if (dropdown) {
    dropdown.classList.toggle("open");
  }
}


/* =========================
   ANGEBOT MODAL
========================= */

function loadOfferModal() {
  const modalPlace = document.getElementById("site-offer-modal");

  if (!modalPlace) {
    return Promise.resolve();
  }

  return fetch("components/angebot-modal.html")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Modal konnte nicht geladen werden: " + response.status);
      }

      return response.text();
    })
    .then(function (data) {
      modalPlace.innerHTML = data;
      setupOfferFormValidation();
    })
    .catch(function (error) {
      console.error("Angebot Modal konnte nicht geladen werden:", error);
    });
}

/* Hap modal-in nga çdo button me class .offer-open */

document.addEventListener("click", function (event) {
  const offerButton = event.target.closest(".offer-open");

  if (!offerButton) return;

  event.preventDefault();
  openOfferModal();
});


/* =========================
   OFFER FORM VALIDATION
========================= */

function setupOfferFormValidation() {
  const modal = getOfferModal();

  if (!modal) return;

  const phoneField = findFieldByLabel(/telefonnummer/i, modal);
  const totalAreaField = findFieldByLabel(/gesamtfläche|gesamtflaeche/i, modal);
  const roomsField = findFieldByLabel(/anzahl der zimmer/i, modal);
  const bathroomsField = findFieldByLabel(/anzahl der badezimmer/i, modal);
  const cleaningPerMonthField = findFieldByLabel(/reinigung pro monat/i, modal);

  if (phoneField) {
    setupPhoneField(phoneField);
  }

  setupNumberField(totalAreaField);
  setupNumberField(roomsField);
  setupNumberField(bathroomsField);
  setupNumberField(cleaningPerMonthField);

  const form = modal.querySelector("form");

  if (form && !form.dataset.validationReady) {
    form.dataset.validationReady = "true";

    form.addEventListener("submit", function (event) {
      const isValid = validateOfferForm();

      if (!isValid) {
        event.preventDefault();
      }
    });
  }
}


/* Gjen input/select/textarea sipas label-it */

function findFieldByLabel(regex, scope) {
  const labels = scope.querySelectorAll("label");

  for (const label of labels) {
    const labelText = label.textContent.trim();

    if (regex.test(labelText)) {
      const forId = label.getAttribute("for");

      if (forId) {
        const fieldById = scope.querySelector("#" + CSS.escape(forId));

        if (fieldById) {
          return fieldById;
        }
      }

      const formGroup = label.closest(".form-group");

      if (formGroup) {
        const field = formGroup.querySelector("input, textarea, select");

        if (field) {
          return field;
        }
      }
    }
  }

  return null;
}


/* Telefoni: lejon vetëm numra dhe + vetëm në fillim */

function setupPhoneField(input) {
  if (!input || input.dataset.phoneReady) return;

  input.dataset.phoneReady = "true";
  input.setAttribute("inputmode", "tel");
  input.setAttribute("autocomplete", "tel");
  input.setAttribute("placeholder", "z.B. +4917623327860");
  input.required = true;

  input.addEventListener("input", function () {
    input.value = sanitizePhone(input.value);
    input.setCustomValidity("");
  });

  input.addEventListener("blur", function () {
    validatePhone(input);
  });
}


function sanitizePhone(value) {
  value = value.trim();

  const hasPlusAtStart = value.startsWith("+");
  const digitsOnly = value.replace(/\D/g, "");

  if (hasPlusAtStart) {
    return "+" + digitsOnly;
  }

  return digitsOnly;
}


function validatePhone(input) {
  const value = input.value.trim();

  if (!value) {
    input.setCustomValidity("Bitte geben Sie Ihre Telefonnummer ein.");
    return false;
  }

  if (!/^\+?\d{6,15}$/.test(value)) {
    input.setCustomValidity("Bitte geben Sie eine gültige Telefonnummer ein. Erlaubt sind nur Zahlen und optional + am Anfang.");
    return false;
  }

  input.setCustomValidity("");
  return true;
}


/* Numër fields: lejon vetëm numra */

function setupNumberField(input) {
  if (!input || input.dataset.numberReady) return;

  input.dataset.numberReady = "true";
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");

  input.addEventListener("input", function () {
    input.value = sanitizeNumber(input.value);
    input.setCustomValidity("");
  });

  input.addEventListener("blur", function () {
    validateNumberField(input);
  });
}


function sanitizeNumber(value) {
  return value.replace(/\D/g, "");
}


function validateNumberField(input) {
  const value = input.value.trim();

  if (value && !/^\d+$/.test(value)) {
    input.setCustomValidity("Bitte geben Sie nur Zahlen ein.");
    return false;
  }

  input.setCustomValidity("");
  return true;
}


function validateOfferForm() {
  const modal = getOfferModal();

  if (!modal) return true;

  const phoneField = findFieldByLabel(/telefonnummer/i, modal);
  const totalAreaField = findFieldByLabel(/gesamtfläche|gesamtflaeche/i, modal);
  const roomsField = findFieldByLabel(/anzahl der zimmer/i, modal);
  const bathroomsField = findFieldByLabel(/anzahl der badezimmer/i, modal);
  const cleaningPerMonthField = findFieldByLabel(/reinigung pro monat/i, modal);

  let isValid = true;

  if (phoneField) {
    phoneField.value = sanitizePhone(phoneField.value);

    if (!validatePhone(phoneField)) {
      isValid = false;
      phoneField.reportValidity();
      return false;
    }
  }

  const numberFields = [
    totalAreaField,
    roomsField,
    bathroomsField,
    cleaningPerMonthField
  ];

  for (const field of numberFields) {
    if (!field) continue;

    field.value = sanitizeNumber(field.value);

    if (!validateNumberField(field)) {
      isValid = false;
      field.reportValidity();
      return false;
    }
  }

  return isValid;
}


/* =========================
   CLOSE WITH ESC
========================= */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeOfferModal();

    const dropdown = document.querySelector(".nav-dropdown");

    if (dropdown) {
      dropdown.classList.remove("open");
    }
  }
});


/* =========================
   CLICK OUTSIDE + CLOSE BUTTON
========================= */

document.addEventListener("click", function (event) {
  const modal = getOfferModal();

  if (modal && event.target === modal) {
    closeOfferModal();
  }

  const closeButton = event.target.closest(".modal-close");

  if (closeButton) {
    event.preventDefault();
    closeOfferModal();
  }

  const dropdown = document.querySelector(".nav-dropdown");

  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
  }
});