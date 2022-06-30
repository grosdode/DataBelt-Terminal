const DomEl = {
  button: {
    yes: document.getElementById("yesButton"),
    no: document.getElementById("noButton"),
  }
}

DomEl.button.yes.addEventListener("click", performDFU);
DomEl.button.no.addEventListener("click", cancleDFU);

function performDFU() {
    window.api.send("shouldPerformeDFU", "yes");
    window.close();
}

function cancleDFU() {
    window.api.send("shouldPerformeDFU", "no");
    window.close();
}

let locale = localStorage.getItem("language");
// let locale = "de";
if (null == locale) {
  locale = languages[0];
  localStorage.setItem("language", "en");
}

// Page content is ready
document.addEventListener("DOMContentLoaded", () => {
  translateHTMLElements();
});

function translateHTMLElements() {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}

// Replace the inner text of the given HTML element
function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[locale][key];
  element.innerText = translation;
}