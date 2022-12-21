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

    socket.on("createRoom", () => {
      console.log("User asked to create room");
      // Create room
      roomsList[socket.id] = {
        roomName: "my room",
        users: [
          {
            id: socket.id,
            pickedImage: false,
            voted: false,
            roundScore: 0,
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
            pickedImage: false,
            voted: false,
            roundScore: 0,
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

    socket.on("startNewRound", (uniqueRoomIdentifier, randomWordsToSend) => {
      roomsList[uniqueRoomIdentifier].users = roomsList[uniqueRoomIdentifier].users.map((currentUser) => {
        currentUser.voted = false;
        currentUser.pickedImage = false;
        currentUser.roundScore = 0;
        return currentUser;
      });

      io.in(uniqueRoomIdentifier).emit("newRoundStarted", randomWordsToSend);
    });

    socket.on("imagePicked", (uniqueRoomIdentifier, imagePicked) => {
      const res = {
        userThatPicked: socket.id,
        image: imagePicked,
      };

      const indexOfUserThatPickedImage = roomsList[uniqueRoomIdentifier].users.findIndex(
        (current) => current.id === socket.id
      );

      roomsList[uniqueRoomIdentifier].users[indexOfUserThatPickedImage].pickedImage = true;

      console.log("about to send this data to client");

      io.in(uniqueRoomIdentifier).emit("userSubmittedImage", res); // 2nd parameter = the user who picked the image

      let numberOfUsersThePickedImage = 0;
      for (let i = 0; i < roomsList[uniqueRoomIdentifier].users.length; i++) {
        if (roomsList[uniqueRoomIdentifier].users[i].pickedImage === true) {
          numberOfUsersThePickedImage++;
        }
      }

      // If all users submitted image
      if (numberOfUsersThePickedImage === roomsList[uniqueRoomIdentifier].users.length) {
        io.in(uniqueRoomIdentifier).emit("allUsersSubmittedImage");
      }
    });

    socket.on("voteForWinningPhoto", (uniqueRoomIdentifier, uniqueIDofUserThatSubmittedThisImage) => {
      const indexOfMe = roomsList[uniqueRoomIdentifier].users.findIndex((current) => current.id === socket.id);
      roomsList[uniqueRoomIdentifier].users[indexOfMe].voted = true;

      const indexOfUserWhosePhotoPicked = roomsList[uniqueRoomIdentifier].users.findIndex(
        (current) => current.id === uniqueIDofUserThatSubmittedThisImage
      );
      roomsList[uniqueRoomIdentifier].users[indexOfUserWhosePhotoPicked].roundScore++;

      // Detect if all users voted
      let numberOfUsersThatVoted = 0;
      for (let i = 0; i < roomsList[uniqueRoomIdentifier].users.length; i++) {
        if (roomsList[uniqueRoomIdentifier].users[i].voted === true) {
          numberOfUsersThatVoted++;
        }
      }

      // if all users voted
      if (numberOfUsersThatVoted === roomsList[uniqueRoomIdentifier].users.length) {
        io.in(uniqueRoomIdentifier).emit("allUsersVoted", roomsList[uniqueRoomIdentifier].users); // Updated users array with roundScore of each user

        // winnersData will hold in each item the user data that won.
        // It can have more than one item if there is more than one winner, if all users inside winnersData have the same roundScore
        let winnersData = [];
        let max = 0;
        for (let i = 0; i < roomsList[uniqueRoomIdentifier].users.length; i++) {
          if (roomsList[uniqueRoomIdentifier].users[i].roundScore > max) {
            max = roomsList[uniqueRoomIdentifier].users[i].roundScore;
            winnersData = [];
            winnersData.push(roomsList[uniqueRoomIdentifier].users[i]);
          } else if (roomsList[uniqueRoomIdentifier].users[i].roundScore === max) {
            winnersData.push(roomsList[uniqueRoomIdentifier].users[i]);
          }
        }

        // const winnerData = roomsList[uniqueRoomIdentifier].users
        io.in(uniqueRoomIdentifier).emit("winners", winnersData);
      }
    });
  });
};
