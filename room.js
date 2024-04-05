let socket = io('http://localhost:5000')

const urlParams = new URLSearchParams(window.location.search)

socket.on('connect', () => {
    console.log(socket)
    password = prompt('password')
    if (!password) {
        socket.disconnect()
        return
    }
    socket.emit('joinroom', { 'url': urlParams.get('room'), 'password': password }, (response) => {
        if (response) {
            alert('Join room success')
            // get response from server
            let title = document.querySelector('.title')
            title.innerText = response.roomName
        } else {
            alert('Join room failed')
            socket.disconnect()
        }
    })
    console.log(socket)
})

socket.on('disconnect', () => {
    console.log('disconnect')
})


socket.on('message', (message) => {
    // add message to chat
    const messageBox = '<div class="message-box">'
        + '<span class="pseudo">Alex</span>'
        + '<span class="message">' + message + '</span></div>'
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox
})

// send message to room

const sendButton = document.querySelector('.send')

sendButton.addEventListener('click', () => {
    const message = document.querySelector('.input-message').value
    socket.emit('message', { 'url': urlParams.get('room'), 'message': message })
    document.querySelector('.input-message').value = ''
})