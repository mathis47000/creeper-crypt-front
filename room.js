let socket = io("http://127.0.0.1:5000");

const urlParams = new URLSearchParams(window.location.search);
let pseudo = null;
let color = null;
let room = null;

let publicKey,
  privateKey = null;

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

socket.on("connect", () => {
  console.log(socket);

  room = urlParams.get("room") ?? prompt("Enter room id");

  if (!room) {
    socket.disconnect();
    redirectHome();
    return;
  }
  let password;
  if (document.referrer.includes("home")) {
    password = urlParams.get("pwd") ?? prompt("password");
  } else {
    password = prompt("password");
  }

  window.history.pushState(
    {},
    document.title,
    window.location.pathname.split("/room")[0] + "/room/?room=" + room
  );

  if (!password) {
    socket.disconnect();
    redirectHome();
    return;
  }
  socket.emit("getpublickey", { room }, (response) => {
    if (response) {
      importPublicKey(response.public_key).then((publicKeyRes) => {
        publicKey = publicKeyRes;
        socket.emit(
          "joinroom",
          {
            id: room,
            password: password,
            publicKey: response.public_key,
          },
          (response) => {
            if (response) {
              importPrivateKey(response.privateKey).then((privateKeyRes) => {
                // get response from server
                pseudo = response.pseudo;
                color =
                  "#" +
                  Math.floor(Math.random() * 0x888888 + 0x888888).toString(16);
                setUserColor(color);
                let messages = response.messages;

                privateKey = privateKeyRes;

                messages.forEach((message) => {
                  addMessage(message);
                });

                decryptMessage(response.roomName, privateKey).then(
                  (decryptedMessage) => {
                    addInfoMessage("Bienvenue sur CreeperCrypt !");
                    addInfoMessage("Connecté au salon : " + decryptedMessage);
                  }
                );
              });

              scrollToBottom();
            } else {
              alert("Echec de connexion au salon");
              socket.disconnect();
              redirectHome();
            }
          }
        );
        console.log(socket);
      });
    }
  });
});

socket.on("disconnect", () => {
  socket.connect();
});

socket.on("message", (message) => {
  // add message to chat
  addMessage(message);
  scrollToBottom();
});

function setUserColor(color) {
  var styleElement = document.createElement("style");
  styleElement.type = "text/css";

  styleElement.textContent = `
    .message-box.local > .pseudo {
        background-color: ${color}; /* Utilisation de la variable color */
    }
`;
  document.head.appendChild(styleElement);
}

function addMessage(message) {
  message = JSON.parse(message);
  decryptMessage(message.content, privateKey).then((decryptedMessage) => {
    if (message.content) {
      let messageBox = null;
      if (pseudo === message.pseudo) {
        messageBox =
          '<div class="message-box local">' +
          '<span class="pseudo">' +
          message.pseudo +
          "</span>" +
          '<span class="message">: ' +
          decryptedMessage +
          "</span></div>";
      } else {
        messageBox =
          '<div class="message-box">' +
          '<span class="pseudo">' +
          message.pseudo +
          "</span>" +
          '<span class="message">: ' +
          decryptedMessage +
          "</span></div>";
      }
      const messageContainer = document.querySelector(".message-container");
      messageContainer.innerHTML += messageBox;
    }
  });
}

function addInfoMessage(message) {
  const messageBox =
    '<div class="info-box">' +
    '<span class="info">' +
    message +
    "</span></div>";
  const messageContainer = document.querySelector(".message-container");
  messageContainer.innerHTML += messageBox;
}

function addTempInfoMessage(message) {
  const messageBox =
    '<div class="temp info-box">' +
    '<span class="info">' +
    message +
    "</span></div>";
  const messageContainer = document.querySelector(".message-container");
  messageContainer.innerHTML += messageBox;
  setTimeout(() => {
    const tempInfoBox = document.querySelector(".temp.info-box");
    tempInfoBox.remove();
  }, 5000);
}

// send message to room

const sendButton = document.querySelector(".send");

sendButton.addEventListener("click", () => {
  const message = document.querySelector(".input-message").value.trim();
  if (message) {
    if (!sendCooldown) {
      encryptData(message, publicKey).then((encryptedMessage) => {
        socket.emit("message", {
          id: room,
          message: encryptedMessage,
          pseudo: pseudo,
        });
      });
      document.querySelector(".input-message").value = "";
      sendCooldownFunction();
    } else {
      if (countdown < 2) {
        addTempInfoMessage(
          "Veuillez attendre " +
            countdown +
            " seconde avant de renvoyer un message !"
        );
      } else {
        addTempInfoMessage(
          "Veuillez attendre " +
            countdown +
            " secondes avant de renvoyer un message !"
        );
      }
    }
    scrollToBottom();
  }
});

// implement send cooldown to prevent spam
let sendCooldown = false;
const sendCooldownTime = 3000;
// décompte
let countdown = sendCooldownTime / 1000;

function sendCooldownFunction() {
  sendCooldown = true;
  const interval = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(interval);
      countdown = sendCooldownTime / 1000;
      sendCooldown = false;
    }
  }, 1000);
}

function redirectHome() {
  window.location.href = window.location.href.split("/room")[0] + "/home";
}

const leave = document.querySelector(".leave");
leave.addEventListener("click", () => {
  redirectHome();
});

const toggle = document.querySelector(".nightModeToggle");
toggle.addEventListener("click", () => {
  const body = document.querySelector("body");
  body.classList.toggle("dark");
});

//add event listener to input message
const inputMessage = document.querySelector(".input-message");
inputMessage.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});

const share = document.querySelector(".share");
share.addEventListener("click", () => {
  const userToSend = prompt("Entrez l'email de la personne à inviter");
  if (userToSend) {
    if (validateEmail(userToSend)) {
      const password = prompt("Entrez le mot de passe du salon");
      if (password) {
        socket.emit(
          "sharelink",
          {
            email: userToSend,
            id: room,
            password: password,
            room_url: window.location.href,
          },
          (response) => {
            if (response) {
              if (response.message === "email sent") {
                alert(
                  "Email envoyé \n Veuillez vérifier votre courrier indésirable"
                );
              } else {
                alert("Erreur lors de l'envoi de l'email");
              }
            } else {
              alert("Erreur lors de l'envoi de l'email");
            }
          }
        );
      } else {
        alert("Email invalide");
      }
    } else {
      alert("Email invalide");
    }
  }
});

// Sélection du conteneur de messages
const messageContainer = document.querySelector(".message-container");

// Fonction pour faire défiler le conteneur vers le bas
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// call scrollToBottom() when a new message is added
const observer = new MutationObserver(scrollToBottom);
observer.observe(messageContainer, { childList: true });

function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

async function importPublicKey(publicKeyString) {
  const keyBuffer = base64ToArrayBuffer(publicKeyString);

  return await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

async function importPrivateKey(privateKeyString) {
  const keyBuffer = base64ToArrayBuffer(privateKeyString);

  return await window.crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

function base64ToArrayBuffer(base64String) {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function encryptData(data, publicKey) {
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedData
  );

  const encryptedDataString = arrayBufferToBase64(encryptedData);

  return encryptedDataString;
}

async function decryptMessage(encryptedMessage, privateKey) {
  const decryptedMessage = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    base64ToArrayBuffer(encryptedMessage)
  );

  return new TextDecoder().decode(decryptedMessage);
}

function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}
