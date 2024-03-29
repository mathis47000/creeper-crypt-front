// socket io
let socket = io('http://localhost:5000')

socket.on('connection', socket => {
    console.log('connection')
})