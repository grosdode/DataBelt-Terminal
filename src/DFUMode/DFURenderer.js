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