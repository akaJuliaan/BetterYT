let e = [];

function init() {
  loadEmotes().then((emotes) => {
    e = emotes;
    console.log("Successfully loaded Emotes!");
    findChatFrame().then((chat) => {
      console.log("Found Chat-Frame!");
      setInterval(() => {
        for (const message of chat.getElementById("chat-messages").querySelectorAll("yt-live-chat-text-message-renderer")) {
          replaceEmotes(message, emotes);
        }
      }, 500);
    });
  });
}

function replaceEmotes(message, emotes) {
  for (const emote of emotes) {
    let content = message.querySelector("#message");
    for (const node of content.childNodes) {
      setTimeout(() => {
        if (node.nodeType != Node.TEXT_NODE) return;
        const nodeContent = node.nodeValue;
        if (!nodeContent) return;
        if (nodeContent.includes(emote.name)) {
          //Wie geil Pog hahaha
          const begin = nodeContent.indexOf(emote.name);
          const end = begin + emote.name.length;

          const textAfterEmote = nodeContent.substring(end, nodeContent.length);
          const textBeforeEmote = nodeContent.substring(0, begin);

          node.nodeValue = nodeContent.replace(emote.name, "");

          //let newNode = content.cloneNode(true);
          let newNode = document.createElement("span");
          //newNode.setAttribute("id", content.id);

          let img = document.createElement("IMG");
          img.setAttribute("src", emote.link);
          img.setAttribute("alt", emote.name);
          img.setAttribute("style", "vertical-align:middle");
          img.setAttribute("class", "yt-formatted-string style-scope yt-live-chat-text-message-renderer");
          img.setAttribute("shared-tooltip-text", ":BetterYT:");
          newNode.appendChild(document.createTextNode(textBeforeEmote));
          newNode.appendChild(img);
          newNode.appendChild(document.createTextNode(textAfterEmote));

          content.replaceChild(document.createTextNode(textBeforeEmote), node);
          const emote_img = content.insertBefore(img, node.nextSibling);
          content.insertBefore(document.createTextNode(textAfterEmote), emote_img.nextSibling);

          //content.replaceWith(newNode);
          //replaceEmotes(message, e); //if more than 1 emote
        }
      }, 500);
    }
  }
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
