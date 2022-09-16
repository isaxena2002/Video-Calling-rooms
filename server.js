// const express = require('express')
// // const res = require('express/lib/response')

// const app = express()
// //server for socket.io
// const server = require('http').Server(app)
// const io = require('socket.io')(server)


// //to create RoomIds 
// // v4 is a function
// const { v4: uuidV4 } = require('uuid')


// //for view engine... on how to render our views
// app.set('view engine', 'ejs')

// //static folder setup
// app.use(express.static('public'))


// app.get('/',(req, res) =>{
//     res.redirect(`/${uuidV4()}`)
// })


// //dynamic url to pass to get a room
// app.get('/:room', (req, res) =>{
//     res.render('room', {roomId: req.params.room})
// })

// //run anytime someone connects to our webpage
// io.on('connection', socket =>{
//     //event listener --> whenever we join the room, we have to set up th userid and roomid i.e whenever we have a user, and the room, we will call the join-room event
//     socket.on('join-room', (roomId, userId)=>{
//         //socket is joining the room
//         socket.join(roomId)

//         //sending a message to the room , broadcast sends a message to everyone else except us
//         socket.broadcast.to(roomId).emit('user-connected', userId)




//         //on disconnect, ie if we go to any url or for some reason disconnects from the room this function will be called
//         socket.on('disconnect', ()=>{
//             socket.broadcast.to(roomId).emit('user-disconnected', userId)

//         })
//     })
// })






// server.listen(3000);




const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const ssl = require('./heroku-ssl')
const port = process.env.PORT

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(ssl())
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(port || 3000)