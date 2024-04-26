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
    const roomName = prompt('Entrez le nom de salle ')
    if (roomName) {
        const password = prompt('Saisissez le mot de passe')
        if (password) {
            socket.emit('createroom', {roomName, password}, (response) => {
                if (response) {
                    // sleep 1s
                    setTimeout(() => {
                        // add room attribute to the url
                        window.location.href = window.location.href.split('/home')[0] + '/room/?room=' + response.id + '&pwd=' + password
                    }, 1000)
                } else {
                    alert('Cette salle existe déjà !')
                }
            })
        }
    }
})

const joinRoom = document.querySelector('.join-room')

joinRoom.addEventListener('click', () => {
    window.location.href = window.location.href.split('/home')[0] + '/room/'
})



