let socket = io('http://localhost:5000')

const urlParams = new URLSearchParams(window.location.search)

socket.on('connect', () => {
    console.log(socket)
    password = prompt('password')
    if (!password) {
        socket.disconnect()
        return
    }
    socket.emit('joinroom', { 'id': urlParams.get('room'), 'password': password }, (response) => {
        if (response) {
            alert('Join room success')
            // get response from server
            let title = document.querySelector('.title')
            title.innerText = response.roomName
            let messages = response.messages
            messages.forEach(message => {
                addMessage(message)
            })
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
})

function addMessage(message) {
    const messageBox = '<div class="message-box">'
        + '<span class="pseudo">Alex</span>'
        + '<span class="message">' + message + '</span></div>'
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox
}

// send message to room

const sendButton = document.querySelector('.send')

sendButton.addEventListener('click', () => {
    const message = document.querySelector('.input-message').value
    socket.emit('message', { 'id': urlParams.get('room'), 'message': message })
    document.querySelector('.input-message').value = ''
})