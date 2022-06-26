init();

function init() {
  loadEmotes().then((emotes) => {
    console.log("Successfully loaded Emotes!");
    findChatFrame().then((chat) => {
      console.log("Found Chat-Frame!");
      registerTabcomplete(chat.querySelector("#input"), chat, emotes);
      registerObserver(chat.querySelector("#chat #items"), emotes);
    });
  });
}

function replaceEmotes(message, emotes) {
  let content = message.querySelector("#message");
  for (const emote of emotes) {
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

        if (textBeforeEmote !== "") content.replaceChild(document.createTextNode(textBeforeEmote), node);
        else node.remove();

        const emote_img = content.insertBefore(img, nextSibling);
        if (textAfterEmote !== "") content.insertBefore(document.createTextNode(textAfterEmote), emote_img.nextSibling);
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

const suggestions = [];
function registerTabcomplete(input, root, emotes) {
  input.addEventListener("keydown", (e) => {
    if (e.key == "Tab") {
      const chatField = e.currentTarget.querySelector("#input");
      const splittedMessage = chatField.textContent.split(" ");
      const lastWord = splittedMessage[splittedMessage.length - 1];

      let emote = "";
      if (suggestions.length <= 0) {
        for (const emote of emotes) {
          if (emote.name.toLowerCase().substring(0, lastWord.length) == lastWord.toLowerCase()) {
            suggestions.push(emote.name);
          }
        }
      } else {
        let i = suggestions.findIndex((x) => x.toLowerCase() == lastWord.toLowerCase());

        if (i == suggestions.length - 1) i = -1;
        emote = suggestions[i + 1];

        let newMessage = chatField.textContent.substring(0, chatField.textContent.lastIndexOf(" ")) + " " + emote;
        if (newMessage.charAt(0) == " ") newMessage = newMessage.substring(1);
        chatField.textContent = newMessage;
      }

      const eventInput = new InputEvent("input", {
        bubbles: true,
        cancelable: false,
      });

      chatField.dispatchEvent(eventInput);
      chatField.focus();

      const range = root.createRange();
      const sel = root.getSelection();

      range.setStart(chatField.childNodes[0], chatField.textContent.length);
      range.collapse(true);

      sel.removeAllRanges();
      sel.addRange(range);

      e.preventDefault();
    } else suggestions.length = 0;
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
