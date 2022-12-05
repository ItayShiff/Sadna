import React from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

function uniqueRoomIdentifier({ roomExisting, roomName, users }) {

  if (roomExisting === false) {
    return (
      <div>Room not found</div>
    )
  }


  const router = useRouter()
  const { uniqueRoomIdentifier } = router.query

  console.log(uniqueRoomIdentifier)

  return (
    <div>
      <div>The name of the uniqueRoomIdentifier: {uniqueRoomIdentifier}</div>
      <div>{roomName}</div>
    </div>
  )
}


export async function getServerSideProps(context) {
	try {
		const uniqueRoomIdentifier = context.params.uniqueRoomIdentifier

    console.log(uniqueRoomIdentifier);
		const response = await axios.get(`http://localhost:3000/api/room/${uniqueRoomIdentifier}`)


    return {
      props: {...response.data}
    }

	} catch (err) {
    return {
      props: {
        roomExisting: false,
      },
    }
	}
}

export default uniqueRoomIdentifier