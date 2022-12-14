import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import socket from "../../components/socketio/socket";

function uniqueRoomIdentifier({ roomExisting, roomName, users: usersListWhenRoomOpened }) {
  if (roomExisting === false) {
    return <div>Room not found</div>;
  }

  const router = useRouter();
  const { uniqueRoomIdentifier } = router.query;

  const [users, setUsers] = useState(usersListWhenRoomOpened); //!!!!!!  !!! !!!

  useEffect(() => {
    if (roomExisting === false) {
      return;
    }

    console.log("Room existing");
    socket.emit("joinedRoom", uniqueRoomIdentifier);

    socket.on("updatedRoom", (updatedRoom) => {
      setUsers(updatedRoom.users);
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

  return (
    <div>
      <div>The name of the uniqueRoomIdentifier: {uniqueRoomIdentifier}</div>
      <div>{roomName}</div>

      <div>LIST OF USERS:</div>
      {users.map((currentUser, index) => (
        <div key={currentUser.id}>{currentUser.id}</div>
      ))}
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
