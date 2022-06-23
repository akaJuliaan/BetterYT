var iframeDocument;
var inputField;
var jsonArray = [];
var frameFinder;
var observer;

start();

//global Events
window.addEventListener('yt-navigate', function(e) {
    if (observer != null) {
        observer.disconnect(); //disconnect before page leave        
    }
    if (frameFinder) {
        clearInterval(frameFinder);
        frameFinder = null;
    }
});

window.onbeforeunload = function() {
    if (observer != null) {
        observer.disconnect(); //disconnect before page leave        
    }
    if (frameFinder) {
        clearInterval(frameFinder);
        frameFinder = null;
    }
};

window.addEventListener('yt-navigate-finish', function(e) {
    start(); //start listener on page load
});

function start() {
    //load emotes
    httpGetAsync("https://julian.gmbh/betteryt/api.php", function(response) {
        jsonArray = JSON.parse(response);

        //search for frame
        if (!frameFinder) {
            frameFinder = setInterval(function() {
                iframe = document.getElementById('chatframe');
                if (iframe != null) {
                    iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDocument != null) {
                        inputField = iframeDocument.querySelector("#input");
                        if (inputField != null) {
                            registerEvents();
                            replaceEmotes();
                            clearInterval(frameFinder);
                            frameFinder = null;
                        }
                    }
                }
            }, 250);
        }
    });
}

function registerObeserver(node) {
    observer = new MutationObserver(function callback(records, observer) {
        for (const record of records) {
            node = record.target;
            if (node.id == 'message' | node.tagName == 'yt-live-chat-text-message-renderer') {
                replaceEmotes();
                break;
            }
        }
    });

    observer.observe(node, {
        subtree: true,
        childList: true
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function registerEvents() {

    chatitems = iframeDocument.querySelectorAll("#items")[1];
    if (chatitems != null) {
        registerObeserver(chatitems);
    }

    //isn't needed bc observer
    /*iframeDocument.addEventListener('yt-live-chat-send-message', e => {
            replaceEmotes();        
    });*/

    suggestions = [];
    inputField.addEventListener('keydown', e => {
        if (e.key == "Tab") {
            realField = iframeDocument.getElementsByClassName('yt-live-chat-text-input-field-renderer')[1];
            inputMessage = realField.textContent;
            splittedMessage = inputMessage.split(" ");
            lastWord = splittedMessage[splittedMessage.length - 1];

            emote = "";

            if (suggestions.length <= 0) {
                for (const emoji of jsonArray) {
                    if (emoji.name.toLowerCase().substring(0, lastWord.length) == lastWord.toLowerCase()) {
                        suggestions.push(emoji.name);
                    }
                }
            } else {
                index = suggestions.findIndex(x => x.toLowerCase() == lastWord.toLowerCase());
                isLast = index == suggestions.length - 1;

                if (isLast) index = -1;
                emote = suggestions[index + 1];

                modified = realField.textContent.substring(0, realField.textContent.lastIndexOf(" ")) + " " + emote;

                if (modified.charAt(0) == " ") modified = modified.substring(1);
                realField.textContent = modified;
            }

            const eventInput = new InputEvent('input', {
                bubbles: true,
                cancelable: false
            });

            realField.focus();
            iframeDocument.execCommand('selectAll', false, null);
            iframeDocument.getSelection().collapseToEnd();

            realField.dispatchEvent(eventInput);

            e.preventDefault();

        } else {
            suggestions = [];
        }
    });
}

function replaceEmotes() {
    for (const emote of jsonArray) {
        replaceEmote(emote.name, emote.link);
    }
}

function replaceEmote(emoteName, emoteUrl) {
    chatmessages = iframeDocument.getElementById("chat-messages");
    if (chatmessages != null) {
        messages = chatmessages.querySelectorAll("#message");

        for (let i = messages.length - 1; i > 0; i--) {

            //remove emote as png from message bc performance
            if (i < messages.length - 26) /* true after newest 26 msg's */ {
                msg = messages[i];
                for (const element of msg.getElementsByTagName('img')) {
                    element.parentNode.insertBefore(document.createTextNode(element.name), element);
                    element.remove();
                }
                continue;
            }

            let message = messages[i];
            var rawMessage = message.innerHTML.replaceAll(`name="${emoteName}"`, "");

            if (message.textContent.includes(emoteName)) {

                newMessage = "";
                update = false;

                const splittedMessage = rawMessage.split(" ");
                splittedMessage.forEach(word => {
                    modified = word;
                    if (word == emoteName) {
                        modified = `<img id='emoji-${getRandomInt(999)}' style='vertical-align:middle' class='yt-formatted-string style-scope yt-live-chat-text-message-renderer' name='${emoteName}' src='${emoteUrl}' alt='🍕' shared-tooltip-text=':BetterYT:'>`;
                        update = true;
                    }
                    newMessage += modified + " ";
                });
                if (update) {
                    message.innerHTML = newMessage;
                }
            }
        }
    }
}