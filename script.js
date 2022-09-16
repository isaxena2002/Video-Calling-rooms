
//reference of socket, server will connect to our root path
const socket = io('/')


//setting video connection
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

//creating the video element

const myVideo = document.createElement('video')
let userCount=0;
myVideo.muted = true;

const peers = {};


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)

    //we answer stream by stream
    myPeer.on('call', call =>{
        call.answer(stream)

        const video = document.createElement("video")
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        //passing our stream to the new user
        //listen to the event user-connected
        connectToNewUser(userId, stream)
        ++userCount
    })
})


socket.on('user-disconnected', userId =>{
    if(peers[userId]) {
        peers[userId].close()
    }
    --userCount;
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})


function connectToNewUser(userId, stream){
    //call the user that we'll give a certain id to, pass our audio and video stream to that user
    const call= myPeer.call(userId, stream)

    //creating a new video object
    const video = document.createElement('video')

    //calls the stream event, interchange the streams between two users
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close',() =>{
        video.remove()
    })

    peers[userId] = call
}


// allowing myVideo to connect with stream
function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        //we are playing the video whose metadata is passed
        video.play();
    })
    videoGrid.append(video)
}


