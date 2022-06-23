function init() {
  loadEmotes().then((emotes) => {
    console.log("Successfully loaded Emotes!");
    findChatFrame().then((chat) => {
      console.log("Found Chat-Frame!");
    });
  });
}

function replaceEmotes(message) {}

function loadEmotes() {
  return new Promise((resolve, reject) => {
    fetch("https://julian.gmbh/betteryt/api.php")
      .then((response) => {
        return response.json(); // converting byte data to json
      })
      .then((data) => {
        if (Array.isArray(data)) resolve(data);
        else reject("Not able to load Emotes from Server!");
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function findChatFrame() {
  return new Promise((resolve, reject) => {
    const finderId = setInterval(() => {
      const iframe = document.getElementById("chatframe");
      if (!iframe) return;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      if (!iframeDocument) return;
      const inputField = iframeDocument.querySelector("#input");
      if (inputField) {
        clearInterval(finderId);
        resolve(iframeDocument);
      }
    }, 250);
  });
}
