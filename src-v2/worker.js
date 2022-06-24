function init() {
  loadEmotes().then((emotes) => {
    console.log("Successfully loaded Emotes!");
    findChatFrame().then((chat) => {
      console.log("Found Chat-Frame!");
      registerObserver(chat.querySelector("#chat #items"), emotes);
    });
  });
}

function replaceEmotes(message, emotes) {
  for (const emote of emotes) {
    let content = message.querySelector("#message");
    for (const node of content.childNodes) {
      if (node.nodeType != Node.TEXT_NODE) continue;
      const nodeContent = node.nodeValue;
      if (!nodeContent) continue;
      if (nodeContent.includes(emote.name)) {
        const begin = nodeContent.indexOf(emote.name);
        const end = begin + emote.name.length;

        const textAfterEmote = nodeContent.substring(end, nodeContent.length);
        const textBeforeEmote = nodeContent.substring(0, begin);

        let img = document.createElement("IMG");
        img.setAttribute("src", emote.link);
        img.setAttribute("alt", emote.name);
        img.setAttribute("style", "vertical-align:middle");
        img.setAttribute("class", "yt-formatted-string style-scope yt-live-chat-text-message-renderer");
        img.setAttribute("shared-tooltip-text", ":BetterYT:");

        const nextSibling = node.nextSibling;

        //regex => check if only spaces
        if (textBeforeEmote.replace(/\s/g, "").length) content.replaceChild(document.createTextNode(textBeforeEmote), node);
        else node.remove();

        const emote_img = content.insertBefore(img, nextSibling);
        if (textAfterEmote.replace(/\s/g, "").length) content.insertBefore(document.createTextNode(textAfterEmote), emote_img.nextSibling);
      }
    }
  }
}

function registerObserver(items, emotes) {
  observer = new MutationObserver(function callback(records) {
    for (const record of records) {
      const node = record.target;
      if (node.id == "message" || node.tagName == "yt-live-chat-text-message-renderer") {
        for (const message of items.querySelectorAll("yt-live-chat-text-message-renderer")) {
          replaceEmotes(message, emotes);
        }
        break;
      }
    }
  });

  observer.observe(items, {
    subtree: true,
    childList: true,
  });
}

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
