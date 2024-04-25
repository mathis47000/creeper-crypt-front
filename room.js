let socket = io("https://project.fb-cloud.fr", {
    path: "/creeper/v1/socket.io/"
});

const urlParams = new URLSearchParams(window.location.search)
let pseudo = null;
let color = null;
let room = null;

function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

socket.on('connect', () => {
    console.log(socket)

    room = urlParams.get('room') ?? prompt('Enter room id')


    if (!room) {
        socket.disconnect()
        redirectHome()
        return
    }
    let password;
    if (document.referrer.includes("home")) {
        password = urlParams.get('pwd') ?? prompt('password')
    } else {
        password = prompt('password')
    }


    window.history.pushState({}, document.title, "/room/?room=" + room);

    if (!password) {
        socket.disconnect()
        redirectHome()
        return
    }
    socket.emit('joinroom', { 'id': room, 'password': password }, (response) => {
        if (response) {
            alert('Join room success')
            // get response from server
            pseudo = response.pseudo
            color = '#' + Math.floor(Math.random() * 0x888888 + 0x888888).toString(16)
            setUserColor(color)
            let messages = response.messages
            messages.forEach(message => {
                addMessage(message)
            })
            addInfoMessage('Bienvenue sur CreeperCrypt !')
            addInfoMessage('Connecté au salon : ' + response.roomName)
            scrollToBottom()
        } else {
            alert('Join room failed')
            socket.disconnect()
        }
    })
    console.log(socket)
})

socket.on('disconnect', () => {
    socket.connect()
})


socket.on('message', (message) => {
    // add message to chat
    addMessage(message)
    scrollToBottom()
})

function setUserColor(color) {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    styleElement.textContent = `
    .message-box.local > .pseudo {
        background-color: ${color}; /* Utilisation de la variable color */
    }
`;
    document.head.appendChild(styleElement);
}

function addMessage(message) {
    message = JSON.parse(message)
    let messageBox = null
    if (pseudo === message.pseudo) {
        messageBox = '<div class="message-box local">'
            + '<span class="pseudo">' + message.pseudo + '</span>'
            + '<span class="message">: ' + message.content + '</span></div>'
    } else {
        messageBox = '<div class="message-box">'
            + '<span class="pseudo">' + message.pseudo + '</span>'
            + '<span class="message">: ' + message.content + '</span></div>'
    }
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox

}

function addInfoMessage(message) {
    const messageBox = '<div class="info-box">' + '<span class="info">' + message + '</span></div>'
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox
}

function addTempInfoMessage(message) {
    const messageBox = '<div class="temp info-box">' + '<span class="info">' + message + '</span></div>'
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox
    setTimeout(() => {
        const tempInfoBox = document.querySelector('.temp.info-box')
        tempInfoBox.remove()
    }, 5000)
}

// send message to room

const sendButton = document.querySelector('.send')

sendButton.addEventListener('click', () => {
    const message = document.querySelector('.input-message').value.trim()
    if (message) {
        if (!sendCooldown) {
            socket.emit('message', { 'id': room, 'message': message, 'pseudo': pseudo })
            document.querySelector('.input-message').value = ''
            sendCooldownFunction()
        } else {
            if (countdown < 2) {
                addTempInfoMessage('Veuillez attendre ' + countdown + ' seconde avant de renvoyer un message !')
            } else {
                addTempInfoMessage('Veuillez attendre ' + countdown + ' secondes avant de renvoyer un message !')
            }
        }
        scrollToBottom()
    }
})



// implement send cooldown to prevent spam
let sendCooldown = false
const sendCooldownTime = 3000
// décompte
let countdown = sendCooldownTime / 1000

function sendCooldownFunction() {
    sendCooldown = true
    const interval = setInterval(() => {
        countdown--
        if (countdown <= 0) {
            clearInterval(interval)
            countdown = sendCooldownTime / 1000
            sendCooldown = false
        }
    }, 1000)
}

function redirectHome() {
    window.location.href = window.location.origin + window.location.pathname.split('/room')[0] + '/home'
}

const leave = document.querySelector('.leave')
leave.addEventListener('click', () => {
    redirectHome()
})

const toggle = document.querySelector('.nightModeToggle')
toggle.addEventListener('click', () => {
    const body = document.querySelector('body')
    body.classList.toggle('dark')
})

//add event listener to input message
const inputMessage = document.querySelector('.input-message')
inputMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendButton.click()
    }
})

// Sélection du conteneur de messages
const messageContainer = document.querySelector('.message-container');