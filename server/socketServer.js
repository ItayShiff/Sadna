// const shortId = require('shortid')
const socketIO = require("socket.io");
const { SingletonRoomsList } = require("./SingletonRoomsList.js");
let roomsList = SingletonRoomsList.getInstance();

module.exports = function (server) {
  // For realtime sockets
  const io = socketIO.listen(server);
  io.on("connection", (socket) => {
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

    socket.on("createRoom", () => {
      console.log("User asked to create room");
      // Create room
      roomsList[socket.id] = {
        roomName: "my room",
        users: [
          {
            id: socket.id,
          },
        ],
      };

      socket.join(socket.id);

      console.log(roomsList[socket.id]);

      socket.emit("createdRoomSuccessfully", roomsList[socket.id]);
    });

    socket.on("joinedRoom", (uniqueRoomIdentifier) => {
      console.log("Server detected joined", uniqueRoomIdentifier);

      if (SingletonRoomsList.checkIfThisRoomExists(uniqueRoomIdentifier)) {
        console.log("room eixsts");

        // Only the creator of the room has the same socket.id
        if (roomsList[uniqueRoomIdentifier].users[0].id !== socket.id) {
          roomsList[uniqueRoomIdentifier].users.push({
            id: socket.id,
          });
        }

        socket.join(uniqueRoomIdentifier);
        io.in(uniqueRoomIdentifier).emit("updatedRoom", roomsList[uniqueRoomIdentifier]);
      } else {
        socket.emit("updatedRoom", roomsList[uniqueRoomIdentifier]);
      }
    });

    socket.on("leftRoom", (uniqueRoomIdentifier) => {
      // Detect if there's only 1 user left, if yes remove the room
      if (roomsList[uniqueRoomIdentifier].users.length === 1) {
        delete roomsList[uniqueRoomIdentifier];
      } else {
        // Remove the user from the users list in the specific room
        const userIDWhoLeftRoom = socket.id;
        const idToRemoveFromUsersList = roomsList[uniqueRoomIdentifier].users.findIndex(
          (current) => current.id === userIDWhoLeftRoom
        );
        roomsList[uniqueRoomIdentifier].users.splice(idToRemoveFromUsersList, 1);
        io.in(uniqueRoomIdentifier).emit("updatedRoom", roomsList[uniqueRoomIdentifier]);
      }

      // Remove the user from the room
      socket.leave(uniqueRoomIdentifier);
    });

    socket.on("startGame", (uniqueRoomIdentifier, randomWordsToSend) => {
      io.in(uniqueRoomIdentifier).emit("gameStarted", randomWordsToSend);
    });
  });
};
