let socket = io("127.0.0.1:5000");

socket.on('connect', () => {
    console.log('connect')
})

socket.on('disconnect', () => {
    console.log('disconnect')
})

document.getElementById('salon-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    var formData = new FormData(this);

    // Process form data
    var roomName = formData.get('nom-salon');
    var password = formData.get('mot-de-passe');
    var nombrePersonnes = formData.get('nombre-personnes');
    var duration_hours = formData.get('duree-salon-heures');
    var duration_minutes = formData.get('duree-salon-minutes');
    if (duration_hours + duration_minutes == 0) {
        alert('The duration is not valid');
        return false;
    }

    end_time = duration_hours * 60 + duration_minutes


    if (roomName) {
        socket.emit('createroom', { roomName, password, end_time }, (response) => {
            if (response) {
                // sleep 1s
                setTimeout(() => {
                    // add room attribute to the url
                    window.location.href = window.location.origin + window.location.pathname.split('/home')[0] + '/room/?room=' + response.id + '&pwd=' + password
                }, 1000)
            } else {
                alert('Room already exist')
            }
        })
    }
});


/*
// pop up create room
const createRoom = document.querySelector(".validate-room")
createRoom.addEventListener('click', () => {
    const roomName = getElementById("nom-salon")
    const password = getElementById("mot-de-passe")
    const duration_days = getElementById("duree-salon-jours")
    const duration_hours = getElementById("duree-salon-heures")
    if (duration_days + duration_hours == 0) {
        alert('The duration is not valid');
        return false;
    }
    const duration = duration_days * 24 * 60  + duration_hours * 60
    if (roomName) {
        socket.emit('createroom', { roomName, password, duration }, (response) => {
            if (response) {
                // sleep 1s
                setTimeout(() => {
                    // add room attribute to the url
                    window.location.href = window.location.origin + window.location.pathname.split('/home')[0] + '/room/?room=' + response.id+'&pwd='+password
                }, 1000)
            } else {
                alert('Room already exist')
            }
        })
    }
})*/

const joinRoom = document.querySelector('.join-room')

joinRoom.addEventListener('click', () => {
    console.log('join room')
    window.location.href = window.location.origin + window.location.pathname.split('/home')[0] + '/room/'
})

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("mc-button create-room");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
