import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import socket from "../../components/socketio/socket";

const nouns = [
  "cat",
  "moon",
  "sandwich",
  "dog",
  "cat",
  "car",
  "house",
  "tree",
  "pencil",
  "book",
  "chair",
  "computer",
  "telephone",
  "apple",
  "hat",
  "chair",
  "house",
  "tree",
  "car",
  "desk",
  "pencil",
  "computer",
  "book",
  "dog",
  "cat",
  "flower",
  "grass",
  "sky",
  "water",
  "sun",
  "moon",
  "star",
  "road",
  "mountain",
  "river",
  "ocean",
  "sea",
  "stone",
  "brick",
  "paper",
  "phone",
  "television",
  "radio",
];
const verbs = [
  "eating",
  "driving",
  "flying",
  "run",
  "jump",
  "walk",
  "skip",
  "dance",
  "sing",
  "swim",
  "climb",
  "play",
  "run",
  "jump",
  "walk",
  "skip",
  "dance",
  "sing",
  "swim",
  "climb",
  "play",
  "eat",
  "sleep",
  "dream",
  "speak",
  "listen",
  "hear",
  "see",
  "watch",
  "read",
  "write",
  "paint",
  "draw",
  "study",
  "work",
  "drive",
  "cook",
  "bake",
  "build",
  "create",
  "imagine",
  "think",
];

const getRandomNoun = () => {
  return nouns[Math.floor(Math.random() * nouns.length)];
};

const getRandomVerb = () => {
  return verbs[Math.floor(Math.random() * verbs.length)];
};

function uniqueRoomIdentifier({ roomExisting, roomName, users: usersListWhenRoomOpened }) {
  if (roomExisting === false) {
    return <div>Room not found</div>;
  }

  const router = useRouter();
  const { uniqueRoomIdentifier } = router.query;

  const [users, setUsers] = useState(usersListWhenRoomOpened); //!!!!!!  !!! !!!

  const [gameStarted, setGameStarted] = useState(false);
  const [listOfRandomWordsToBeShown, setListOfRandomWordsToBeShown] = useState([]);
  const input = useRef();

  useEffect(() => {
    if (roomExisting === false) {
      return;
    }

    console.log("Room existing");
    socket.emit("joinedRoom", uniqueRoomIdentifier);

    socket.on("updatedRoom", (updatedRoom) => {
      setUsers(updatedRoom.users);
    });

    socket.on("gameStarted", (randomWordsFromServer) => {
      setListOfRandomWordsToBeShown(randomWordsFromServer);
      setGameStarted(true);
    });

    // When user about to leave the room (using Esc or full reload) so it will run
    window.addEventListener("beforeunload", sendMessageToServerLeftRoom);

    // When we leave room
    return () => {
      // If NOT DONE full reload for example if the user Clicked Homepage button
      sendMessageToServerLeftRoom();

      // If DONE full reload and user went to other page so it won't continue listening to this event
      window.removeEventListener("beforeunload", sendMessageToServerLeftRoom);
    };
  }, []);

  const sendMessageToServerLeftRoom = () => {
    socket.emit("leftRoom", uniqueRoomIdentifier);
  };

  console.log(users);

  // console.log(uniqueRoomIdentifier);

  const startGame = () => {
    if (users.length < 3) {
      alert("Room must have at least 3 users in order to start the game");
      return;
    }

    const randomNoun = getRandomNoun();
    const randomVerb = getRandomVerb();
    const randomWordsToSend = [randomNoun, randomVerb];
    socket.emit("startGame", uniqueRoomIdentifier, randomWordsToSend);

    // alert(`game started ${getRandomNoun()} ${getRandomVerb()}`);
  };

  const submitInput = () => {
    console.log(input.current.value);
  };
  console.log("Random words", listOfRandomWordsToBeShown);

  return (
    <div>
      <div>The name of the uniqueRoomIdentifier: {uniqueRoomIdentifier}</div>
      <div id="roomNameContainer">
        <div id="roomName">{roomName}</div>
      </div>

      <div>LIST OF USERS:</div>
      <div id="usersListContainer">
        {users.map((currentUser, index) => (
          <div key={currentUser.id}>
            Guest {index + 1} (unique id: {currentUser.id})
          </div>
        ))}
      </div>

      {gameStarted === false ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div>
          <div>Write a prompt for Craiyon that includes the words you were given:</div>
          <div id="randomWordsWrapper">
            {listOfRandomWordsToBeShown.map((randomWord) => (
              <div key={randomWord} className="randomWord">
                {randomWord}
              </div>
            ))}

            <button onClick={submitInput}>SUBMIT</button>
          </div>
          <input ref={input} />
        </div>
      )}

      <style jsx>{`
        #roomNameContainer {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #randomWordsWrapper {
          display: flex;
          justify-content: space-around;
          align-items: space-around;
        }
        .randomWord {
          margin: 5px;
          border: 1px solid grey;
          border-radius: 10px;
          padding: 10px;
        }
        #roomName {
          color: #137500;
          font-weight: bold;
          text-align: center;
          background-color: #beff9b;
          padding: 5px;
          margin: 10px 0px;
        }
        #usersListContainer {
          border: 1px solid black;
          display: inline-block;
          padding: 3px;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const uniqueRoomIdentifier = context.params.uniqueRoomIdentifier;

    console.log(uniqueRoomIdentifier);
    const response = await axios.get(`http://localhost:3000/api/room/${uniqueRoomIdentifier}`);

    return {
      props: response.data,
    };
  } catch (err) {
    return {
      props: {
        roomExisting: false,
      },
    };
  }
}

export default uniqueRoomIdentifier;
