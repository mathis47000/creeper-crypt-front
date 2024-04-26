let socket = io("https://project.fb-cloud.fr", {
    path: "/creeper/v1/socket.io/"
});

socket.on('connect', () => {
    console.log('connect')
})

let publicKey
let privateKey

generateKeys().then((keys) => {
    publicKey = keys.publicKey
    privateKey = keys.privateKey
})


socket.on('disconnect', () => {
    console.log('disconnect')
})
// pop up create room
const createRoom = document.querySelector('.create-room')
createRoom.addEventListener('click', async () => {
    encryptRoomName(prompt('Enter room name'), publicKey).then((encryptedRoomNameString) => {
        const roomName = encryptedRoomNameString
        const roomPassword = prompt('Enter password')

        exportKeys(publicKey, privateKey).then((keys) => {
            const publicKey = keys.publicKeyString
            const privateKey = keys.privateKeyString

            if (roomName) {
                socket.emit('createroom', {roomName, roomPassword, publicKey, privateKey}, (response) => {
                    if (response) {
                        // add room attribute to the url
                        window.location.href = window.location.origin + window.location.pathname.split('/home')[0] + '/room/?room=' + response.id + '&pwd=' + roomPassword
                    } else {
                        alert('Room already exist')
                    }
                })
            }
        })
    })
})

const joinRoom = document.querySelector('.join-room')

joinRoom.addEventListener('click', () => {
    console.log('join room')
    window.location.href = window.location.origin + window.location.pathname.split('/home')[0] + '/room/'
})

async function encryptRoomName(roomName, publicKey) {
    const encodedRoomName = new TextEncoder().encode(roomName);
    const encryptedRoomName = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        encodedRoomName
    )

    encryptedRoomNameString = arrayBufferToBase64(encryptedRoomName)

    return encryptedRoomNameString
}

async function generateKeys() {
    const {publicKey, privateKey} = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    return {publicKey, privateKey};
}

async function exportKeys(publicKey, privateKey) {
    const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        publicKey
    );

    const publicKeyString = arrayBufferToBase64(exportedPublicKey);

    const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );

    const privateKeyString = arrayBufferToBase64(exportedPrivateKey);

    return {publicKeyString, privateKeyString};
}

function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
}

function base64ToArrayBuffer(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}