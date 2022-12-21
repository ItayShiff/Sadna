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

  const [roundStarted, setNewRoundStarted] = useState(false);
  const [listOfRandomWordsToBeShown, setListOfRandomWordsToBeShown] = useState([]);
  const input = useRef();

  const [images, setImages] = useState([]);
  const [imageSubmissions, setImageSubmissions] = useState([]); // Data of each item is { userThatPicked: socket.id, image: imagePicked, };
  const [allUsersSubmittedImage, setAllUsersSubmittedImage] = useState(false);
  const [allUsersVoted, setAllUsersVoted] = useState(false);

  const userPickedAnImageAlready = useRef(false);
  const userVotedAlready = useRef(false);
  const [winnersData, setWinnersData] = useState([]);

  useEffect(() => {
    if (roomExisting === false) {
      return;
    }

    console.log("Room existing");
    socket.emit("joinedRoom", uniqueRoomIdentifier);

    socket.on("updatedRoom", (updatedRoom) => {
      setUsers(updatedRoom.users);
    });

    console.log("Image submissions ", imageSubmissions);

    socket.on("allUsersSubmittedImage", () => {
      setAllUsersSubmittedImage(true);
    });

    socket.on("allUsersVoted", (updatedUsersList) => {
      setUsers(updatedUsersList);
      setAllUsersVoted(true);
      console.log("All users voted", updatedUsersList);
    });

    socket.on("winners", (winnersDataFromServer) => {
      setWinnersData(winnersDataFromServer);
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

  useEffect(() => {
    socket.on("userSubmittedImage", (userSubmissionData) => {
      const indexInUsersArray = users.findIndex((current) => current.id === userSubmissionData.userThatPicked);

      console.log("RECEIVED user ID that submitted data: ", indexInUsersArray);

      let newImageSubmissions = [...imageSubmissions];
      console.log("image submission before add:", imageSubmissions);
      const newSubmission = {
        userThatPicked: users[indexInUsersArray],
        imagePicked: userSubmissionData.image,
      };

      newImageSubmissions.push(newSubmission);
      setImageSubmissions(newImageSubmissions);
    });

    return () => {
      socket.off("userSubmittedImage");
    };
  }, [imageSubmissions, users]);

  useEffect(() => {
    socket.on("newRoundStarted", (randomWordsFromServer) => {
      // If started a new game from a game that finished
      if (winnersData.length !== 0) {
        resetStatesForNewRound();
        console.log("Reset all states");
      }

      setListOfRandomWordsToBeShown(randomWordsFromServer);
      setNewRoundStarted(true);
    });
  }, [winnersData]);

  const sendMessageToServerLeftRoom = () => {
    socket.emit("leftRoom", uniqueRoomIdentifier);
  };

  // console.log(users);

  // console.log(uniqueRoomIdentifier);

  const resetStatesForNewRound = () => {
    setListOfRandomWordsToBeShown([]);
    setImages([]);
    setImageSubmissions([]); // Data of each item is { userThatPicked: socket.id, image: imagePicked, };
    setAllUsersSubmittedImage(false);
    setAllUsersVoted(false);
    setWinnersData([]);
    userPickedAnImageAlready.current = false;
    userVotedAlready.current = false;
  };

  const startNewRound = () => {
    if (users.length < 3) {
      alert("Room must have at least 3 users in order to start the game");
      return;
    }

    const randomNoun = getRandomNoun();
    const randomVerb = getRandomVerb();
    const randomWordsToSend = [randomNoun, randomVerb];
    socket.emit("startNewRound", uniqueRoomIdentifier, randomWordsToSend);
  };

  const submitInput = async () => {
    const body = {
      prompt: input.current.value,
    };
    try {
      const response = await axios.post("http://localhost:3000/api/images/generate", body);
      setImages(response.data.images);
      alert("success");
    } catch (err) {
      console.log(err);
      alert("Invalid request");
    }
  };

  const clickSubmitImage = (indexOfImage) => {
    if (userPickedAnImageAlready.current === true) {
      alert("You submitted already an image");
      return;
    }

    userPickedAnImageAlready.current = true;
    console.log("CLICKED AN IMAGE", indexOfImage);
    document.getElementById("imagesWrapper").children[indexOfImage].classList.add("pickedThisImage");
    // document.getElementById("imagesWrapper").children[indexOfImage].style.border = "10px solid red";
    socket.emit("imagePicked", uniqueRoomIdentifier, images[indexOfImage]);
  };

  const clickVoteForWinningPhoto = (indexOfImage) => {
    if (userVotedAlready.current === true) {
      alert("You already submitted your vote");
      return;
    }

    const IDofOwnerWhosePhotoIVoted = imageSubmissions.findIndex(
      (submissionData) => submissionData.userThatPicked.id === socket.id
    );
    if (indexOfImage === IDofOwnerWhosePhotoIVoted) {
      alert("You cannot choose your own submission.");
      return;
    }

    userVotedAlready.current = true;

    document.getElementById("imagesWrapper").children[indexOfImage].classList.add("pickedThisImage");
    // document.getElementById("imagesWrapper").children[indexOfImage].style.border = "10px solid red";

    socket.emit("voteForWinningPhoto", uniqueRoomIdentifier, imageSubmissions[indexOfImage].userThatPicked.id);
  };

  // console.log("Random words", listOfRandomWordsToBeShown);

  const getProperPhotoRoundScore = (uniqueIDofUserThatSubmittedThisImage) => {
    const IDofUserInUsersList = users.findIndex((currentUser) => currentUser.id === uniqueIDofUserThatSubmittedThisImage);
    return users[IDofUserInUsersList].roundScore;
  };

  const getProperPhotoSubmitter = (uniqueIDofUserThatSubmittedThisImage) => {
    const IDofUserInUsersList = users.findIndex((currentUser) => currentUser.id === uniqueIDofUserThatSubmittedThisImage);
    return users[IDofUserInUsersList].id;
  };

  return (
    <div>
      <div>The name of the uniqueRoomIdentifier: {uniqueRoomIdentifier}</div>
      <div id="roomNameContainer">
        <div id="roomName">{roomName}</div>
      </div>

      {/* <button onClick={getImage}>GET IMAGE</button> */}

      <div>LIST OF USERS:</div>
      <div id="usersListContainer">
        {users.map((currentUser, index) => (
          <div key={currentUser.id}>
            Guest {index + 1} (unique id: {currentUser.id})
          </div>
        ))}
      </div>
      {imageSubmissions.map((submissionData, index) => (
        <div key={submissionData.userThatPicked.id}>{submissionData.userThatPicked.id} picked an image</div>
      ))}

      {roundStarted === false ? (
        <button onClick={startNewRound}>Start Game</button>
      ) : (
        <div>
          {winnersData.length !== 0 && <button onClick={startNewRound}>Start Game</button>}

          <div id="randomWordsWrapper">
            {listOfRandomWordsToBeShown.map((randomWord) => (
              <div key={randomWord} className="randomWord">
                {randomWord}
              </div>
            ))}
          </div>

          {winnersData.length !== 0 && (
            <div id="winnersWrapper">
              <div>Winners:</div>
              {winnersData.map((winner) => (
                <div key={winner.id}>{winner.id}</div>
              ))}
            </div>
          )}

          {allUsersSubmittedImage === false ? (
            // Submission/generation phase
            <React.Fragment>
              <div>Write a prompt for Craiyon that includes the words you were given:</div>
              <input ref={input} />
              <button onClick={submitInput}>SUBMIT</button>

              <div id="imagesWrapper">
                {images.map((image, index) => (
                  <img
                    key={index}
                    className="image"
                    src={`data:image/png;base64,${image}`}
                    onClick={() => clickSubmitImage(index)}
                  />
                ))}
              </div>
            </React.Fragment>
          ) : (
            // Vote phase
            <div id="imagesWrapper">
              {imageSubmissions.map((submissionData, indexOfSubmittedImage) => (
                <div className="specificImageToVoteForContainer votes">
                  {allUsersVoted === true && (
                    <div>
                      <div>{getProperPhotoSubmitter(submissionData.userThatPicked.id)}</div>
                      <div>{getProperPhotoRoundScore(submissionData.userThatPicked.id)}</div>
                    </div>
                  )}

                  <img
                    key={indexOfSubmittedImage}
                    className="image"
                    src={`data:image/png;base64,${submissionData.imagePicked}`}
                    onClick={() => clickVoteForWinningPhoto(indexOfSubmittedImage)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        #winnersWrapper {
          background: #eaeaea;
          text-align: center;
          border: 2px solid;
        }

        #imagesWrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 20px;
        }

        #imagesWrapper img {
          height: 100%;
          width: 100%;
          border: 10px solid #fff500;
          margin: 0 auto;
          cursor: pointer;
          transition: border-color 0.4s linear;
        }
        #imagesWrapper img.pickedThisImage {
          border: 10px solid #ff6060;
        }
        .specificImageToVoteForContainer.votes.pickedThisImage img {
          border: 10px solid #ff6060 !important;
        }

        .specificImageToVoteForContainer {
          position: relative;
        }
        .specificImageToVoteForContainer > div {
          background: #c5c5c5e6;
          position: absolute;
          left: calc(50% + 10px);
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 20px;
          width: calc(100% - 39px);
          text-align: center;
          font-weight: bold;
        }

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
