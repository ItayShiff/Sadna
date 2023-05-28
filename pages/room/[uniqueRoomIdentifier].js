import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import socket from "../../components/socketio/socket";
import Head from "next/head";
import Link from "next/link";
import nouns from "../../components/utils/nouns";
import verbs from "../../components/utils/verbs";

import { uuid } from "uuidv4";

import { FaSpinner } from "react-icons/fa";
import Layout from "../../components/layout";
import { AiOutlineSend } from "react-icons/ai";
import { SiLitiengine } from "react-icons/si";
import { GoPerson } from "react-icons/go";

const nth = function (d) {
  if (d > 3 && d < 21) return d + "th";
  switch (d % 10) {
    case 1:
      return d + "st";
    case 2:
      return d + "nd";
    case 3:
      return d + "rd";
    default:
      return d + "th";
  }
};

const colorsNames = ["#A8B7FF", "#DFA8A8", "#82D2B1", "#D9C781", "#8E96FF", "#EA97B9"];

const minimumNumberOfPlayersToStartGame = 3;

const getRandomNoun = () => {
  return nouns[Math.floor(Math.random() * nouns.length)];
};

const getRandomVerb = () => {
  return verbs[Math.floor(Math.random() * verbs.length)];
};
function uniqueRoomIdentifier({ roomExisting, users: usersListWhenRoomOpened }, props) {
  // console.log(roomExisting, roomName, usersListWhenRoomOpened, "\n -------- \n", props);

  if (roomExisting === false) {
    return (
      <React.Fragment>
        <Head>
          <title>Invalid Room</title>
        </Head>
        <div id="container">
          <div>Room not found {`:(`}</div>
          <Link href="/">Go Back Homepage</Link>
        </div>
        <style jsx>{`
          #container {
            background: #161616cf;
            position: fixed;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 26px;
            flex-direction: column;
          }
          #container > :global(a) {
            color: white;
            margin-top: 20px;
            border: 1px solid white;
            padding: 7px;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 400ms, color 400ms;
          }

          #container > :global(a):hover {
            background-color: white;
            color: black;
          }
        `}</style>
      </React.Fragment>
    );
  }

  const router = useRouter();
  const { uniqueRoomIdentifier } = router.query;

  const [users, setUsers] = useState(usersListWhenRoomOpened); //!!!!!!  !!! !!!
  console.log("Rendered", users, usersListWhenRoomOpened);

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

  const [chatMessages, setChatMessages] = useState([]);
  const chatInput = useRef();

  const myPrivateUniqueID = useRef();

  // const isSubmittedAlready = useRef(false);
  const [isLoadingImagesGeneration, setIsLoadingImagesGeneration] = useState(false);

  useEffect(() => {
    if (roomExisting === false) {
      return;
    }

    console.log("Room existing");

    socket.emit("joinedRoom", uniqueRoomIdentifier, localStorage.getItem("nickname"));

    socket.on("updatedRoom", (updatedRoom) => {
      if (!updatedRoom || !updatedRoom.users) {
        return;
      }
      // console.log(updatedRoom?.users);
      setUsers(updatedRoom.users);
    });

    socket.on("yourPrivateUniqueID", (myPrivateUniquteIDValue) => {
      myPrivateUniqueID.current = myPrivateUniquteIDValue;
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

  useEffect(() => {
    socket.on("messageArrivedInChat", (messageData) => {
      // Keep only the last 20 messages
      // let initialNumberToCopy = chatMessages.length - 20;
      // if (initialNumberToCopy < 0) {
      //   initialNumberToCopy = 0;
      // }

      // let copiedChatMessages = [];
      // for (let i = initialNumberToCopy; initialNumberToCopy < chatMessages.length; i++) {
      //   copiedChatMessages[i - initialNumberToCopy] = chatMessages[i];
      // }

      const copiedChatMessages = [...chatMessages];
      copiedChatMessages.push(messageData);
      setChatMessages(copiedChatMessages);
    });

    console.log("okay new");
    const element = document.getElementById("chatMessagesContainer");
    if (element) {
      element.scrollTo(0, element.scrollHeight);
    }

    return () => {
      socket.off("messageArrivedInChat");
    };
  }, [chatMessages]);

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
    if (users.length < minimumNumberOfPlayersToStartGame) {
      alert(`Room must have at least ${minimumNumberOfPlayersToStartGame} users in order to start the game`);
      return;
    }

    const randomNoun = getRandomNoun();
    const randomVerb = getRandomVerb();
    const randomWordsToSend = [randomNoun, randomVerb];
    socket.emit("startNewRound", uniqueRoomIdentifier, randomWordsToSend);
  };

  // 1. in reset add isSubmittedAlready = useRef(false);
  // 2. loading animation
  const submitInput = async () => {
    // if (isSubmittedAlready.current === true) {
    //   alert("You already submitted");
    //   return;
    // }

    // isSubmittedAlready.current = true;
    const body = {
      prompt: input.current.value,
    };
    try {
      setIsLoadingImagesGeneration(true);

      // Development:
      const response = await axios.post("http://localhost:3000/api/images/generate", body);
      // Production:
      // const response = await axios.post("https://proompter.onrender.com/api/images/generate", body);

      setIsLoadingImagesGeneration(false);
      setImages(response.data.images);
      alert("success");
    } catch (err) {
      console.log("Possibly Wrong Room ID");
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

    socket.emit("voteForWinningPhoto", uniqueRoomIdentifier, imageSubmissions[indexOfImage].userThatPicked.id);
  };

  const getProperPhotoRoundScore = (uniqueIDofUserThatSubmittedThisImage) => {
    const IDofUserInUsersList = users.findIndex((currentUser) => currentUser.id === uniqueIDofUserThatSubmittedThisImage);
    return users[IDofUserInUsersList].roundScore;
  };

  const getProperPhotoSubmitter = (uniqueIDofUserThatSubmittedThisImage) => {
    const IDofUserInUsersList = users.findIndex((currentUser) => currentUser.id === uniqueIDofUserThatSubmittedThisImage);
    return users[IDofUserInUsersList]?.nickname ?? `Guest ${IDofUserInUsersList + 1}`;
  };

  const sendMessageInChat = () => {
    if (chatInput.current.value && chatInput.current.value !== "") {
      socket.emit(
        "messageSentInChat",
        uniqueRoomIdentifier,
        localStorage.getItem("nickname") ?? "Guest",
        myPrivateUniqueID.current,
        chatInput.current.value
      );

      chatInput.current.value = "";
    }
  };

  const detectEnterForSending = (event) => {
    if (event.key === "Enter") {
      sendMessageInChat();
    }
  };

  if (!users) {
    return <div>Loading</div>;
  }
  return (
    <Layout>
      <Head>
        <title>{users[0].nickname ? `${users[0].nickname}'s room` : "Guest's room"}</title>
      </Head>

      {/* <button onClick={getImage}>GET IMAGE</button> */}
      <main>
        <div id="wrapperAll" className={roundStarted === true ? "started" : undefined}>
          {roundStarted === true ? (
            <div id="startedContainer">
              <div id="usersThatPickedAnImage">
                {imageSubmissions.map((submissionData, index) => (
                  <div key={submissionData.userThatPicked.id}>
                    {submissionData.userThatPicked?.nickname ?? <span>Guest {index + 1}</span>} picked an image
                  </div>
                ))}
              </div>

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
                    {winnersData.map((winner, index) => (
                      <div key={winner.id}>{winner?.nickname ?? `Guest`}</div>
                    ))}
                  </div>
                )}

                {allUsersSubmittedImage === false ? (
                  // Submission/generation phase
                  <React.Fragment>
                    {isLoadingImagesGeneration === false ? (
                      <div id="promptWrapperContainer">
                        <div id="promptWrapper">
                          <div>Write a prompt for Craiyon that includes the words you were given:</div>
                          <input ref={input} />
                          <button onClick={submitInput}>SUBMIT</button>
                        </div>
                      </div>
                    ) : (
                      <div id="wrapperLoadingContainer">
                        <div id="loadingContainer">
                          <FaSpinner size="70px" />
                        </div>
                      </div>
                    )}

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
            </div>
          ) : (
            <div id="notStartedContainer">
              <div id="usersListContainer">
                {users.map((currentUser, index) => (
                  <div key={currentUser.id}>
                    <GoPerson size="100px" color={colorsNames[index % colorsNames.length]} />
                    <div>{currentUser?.nickname ?? <span>Guest {index + 1}</span>}</div>
                  </div>
                ))}
                {users.length < minimumNumberOfPlayersToStartGame && (
                  <React.Fragment>
                    {new Array(minimumNumberOfPlayersToStartGame - users.length).fill().map((curr, index) => (
                      <div key={uuid()} style={{ opacity: "0.2" }}>
                        <GoPerson size="100px" />
                        <div>{nth(users.length + index + 1)} player</div>
                      </div>
                    ))}
                  </React.Fragment>
                )}
              </div>

              <button onClick={startNewRound} id="startGameButton">
                <SiLitiengine size="22px" />
                <div>Start Game</div>
              </button>
            </div>
          )}

          <div>
            {roundStarted === true && (
              <div id="usersListContainer">
                {users.map((currentUser, index) => (
                  <div key={currentUser.id}>
                    <GoPerson size="100px" color={colorsNames[index % colorsNames.length]} />
                    <div>{currentUser?.nickname ?? <span>Guest {index + 1}</span>}</div>
                  </div>
                ))}
              </div>
            )}
            <div id="chatContainer">
              <div id="chatMessagesContainer">
                {chatMessages.map((messageData, index) => (
                  <div key={index} className="messageInChat">
                    <b
                      style={{
                        color: colorsNames[users.findIndex((currUser) => currUser.id === messageData.uniqueSenderID)],
                      }}
                    >
                      {messageData.sender}
                    </b>
                    : {messageData.message}
                  </div>
                ))}
              </div>

              <div id="inputSendChatWrapper">
                <input ref={chatInput} placeholder="Enter text message" onKeyDown={detectEnterForSending} />
                <AiOutlineSend
                  id="sendButtonChat"
                  size="18px"
                  onClick={sendMessageInChat}
                  style={{ padding: "5px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        #chatContainer {
          height: 200px;
          width: 570px;
          margin: 15px;
          border: 1px solid black;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #1e1e1e;
          border: 2px solid#ffec4859;
          border-radius: 15px;
          overflow: hidden;
        }
        #chatContainer input {
          width: 100%;
          padding: 5px 12px;
          color: #dedede;
        }
        #chatMessagesContainer {
          height: 100%;
          overflow-x: hidden;
          padding: 5px;
          margin-bottom: 5px;
        }

        #chatMessagesContainer::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
          background-color: #2a2a2a;
        }

        #chatMessagesContainer::-webkit-scrollbar {
          width: 12px;
          background-color: #1a1a1a;
        }

        #chatMessagesContainer::-webkit-scrollbar-thumb {
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
          background-color: #7c7330;
        }

        main {
          color: #dedede;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        #wrapperAll {
          background: #3f3f3f;
          width: 100%;
          display: flex;
          align-items: center;
        }
        #wrapperAll.started {
          height: calc(100vh - 45px - 15px - 30px);
          margin-top: -15px;
        }
        #notStartedContainer {
          flex: 1;
        }
        #notStartedContainer #usersListContainer {
          padding-top: 10px;
        }

        #startGameButton {
          color: #dedede;
          padding: 15px 32px;
          font-size: 20px;
          cursor: pointer;
          margin: 15px auto;
          border: 2px solid #ffec4859;
          background: unset;
          display: flex;
          align-items: center;
          justify-content: space-around;
          transition: background-color 250ms;
        }
        #startGameButton div {
          margin-left: 10px;
        }
        #startGameButton:hover {
          background-color: #eece86;
          color: black;
        }

        .messageInChat {
          padding: 0px 10px;
        }
        #inputSendChatWrapper {
          display: flex;
          align-items: center;
        }
        #inputSendChatWrapper input {
          outline: none;
          background: #1a1a1a;
          border: 0;
        }
        #sendButtonChat {
          padding: 5px;
          cursor: pointer;
        }

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
          border: 10px solid #1d1d1d;
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

        #usersListContainer {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        #usersListContainer > div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          align-items: center;
        }

        #loadingContainer {
          animation: loadingSpinner 1s infinite 0s;
          display: inline-block;
        }

        #wrapperLoadingContainer {
          display: flex;
          justify-content: center;
        }

        @keyframes loadingSpinner {
          0% {
            rotate: 0deg;
          }
          50% {
            rotate: 180deg;
          }
          100% {
            rotate: 360deg;
          }
        }

        #promptWrapper {
          padding: 10px;
          width: 80%;
          margin: 0 auto;
        }
        #promptWrapperContainer {
          width: 100%;
        }
        #usersThatPickedAnImage {
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    const uniqueRoomIdentifier = context.params.uniqueRoomIdentifier;

    console.log(uniqueRoomIdentifier);
    // Development:
    const response = await axios.get(`http://localhost:3000/api/room/${uniqueRoomIdentifier}`); // API request using Axios
    // Production:
    // const response = await axios.get(`https://proompter.onrender.com/api/room/${uniqueRoomIdentifier}`); // API request using Axios

    console.log("Got successfully", response.data);
    return {
      props: response.data,
    };
  } catch (err) {
    console.log("YES we are in error now");
    return {
      props: {
        roomExisting: false,
      },
    };
  }
}

export default uniqueRoomIdentifier;
