// const shortId = require('shortid')
const socketIO = require('socket.io');

const { SingletonRoomsList } = require("./SingletonRoomsList.js")
let roomsList = SingletonRoomsList.getInstance();

module.exports = function (server) {


    // For realtime sockets
    const io = socketIO.listen(server);
    let counter = 0;
    io.on('connection', (socket) => {
        // When user is opening the website, immediately let everyone know that he joined(updated current users)
        // socket.on('letEveryoneKnowIjoined', () => {
        //     console.log("user opened the website", socket.id)
        //     io.emit('totalCountInWholeWebsite', io.engine.clientsCount);
        // })

        // socket.on('disconnect', () => {
        //     console.log('user disconnected from website', socket.id);
        //     io.emit('totalCountInWholeWebsite', io.engine.clientsCount);
        // });


        // // Only on homepage
        // socket.on('userEnteredHomepage', () => {
        //     console.log("user opened homepage", socket.id)
        //     counter++;
        //     io.emit('totalCounterInHomepage', counter);
        // })

        // socket.on('userLeftHomepage', () => {
        //     console.log("user left homepage", socket.id)
        //     counter--;
        //     io.emit('totalCounterInHomepage', counter);
        // })

        socket.on('createRoom', () => {
            console.log('User asked to create room');
            // Create room
            roomsList[socket.id] = {
                roomName: "my room",
                users: [
                    {
                        id: socket.id,
                    }
                ]
            }

            socket.join(socket.id);

            console.log(roomsList[socket.id]);
            
            socket.emit('createdRoomSuccessfully', roomsList[socket.id]);
        })

    })
}

