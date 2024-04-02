// socket io
let socket = io('http://localhost:5000')

socket.on('connect', () => {
    console.log('connect')
})

socket.on('disconnect', () => {
    console.log('disconnect')
})
// pop up create room
const createRoom = document.querySelector('.create-room')
createRoom.addEventListener('click', () => {
    const roomName = prompt('Enter room name')
    const password = prompt('Enter password')
    if (roomName) {
        socket.emit('createroom', { roomName, password }, (response) => {
            if (response) {
                // sleep 1s
                setTimeout(() => {
                    // add room attribute to the url
                    window.location.href = window.location.origin + '/room/?room=' + response.url
                }, 1000)
            } else {
                alert('Room already exist')
            }
        })
    }
})



socket.on('message', message => {
    // add message to chat
    const messageBox = '<div class="message-box">'
        + '<span class="pseudo">Alex</span>'
        + '<span class="message">' + message + '</span></div>'
    const messageContainer = document.querySelector('.message-container')
    messageContainer.innerHTML += messageBox
})