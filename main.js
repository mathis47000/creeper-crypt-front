let socket = io("https://project.fb-cloud.fr", {
    path: "/creeper/v1/socket.io/"
});

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
                    window.location.href = window.location.origin + '/room/?room=' + response.id+'&pwd='+password
                }, 1000)
            } else {
                alert('Room already exist')
            }
        })
    }
})

const joinRoom = document.querySelector('.join-room')

joinRoom.addEventListener('click', () => {
    console.log('join room')
    window.location.href = window.location.origin + '/room/'
})



