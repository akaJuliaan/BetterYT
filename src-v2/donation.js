document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("msg").innerHTML = chrome.i18n.getMessage("appDonation");

  document.body.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      setTimeout(() => {
        window.close();
      }, 100);
    }
  });
});
