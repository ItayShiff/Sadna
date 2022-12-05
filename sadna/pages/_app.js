import '../styles/globals.css'
import socket from '../components/socketio/socket'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    socket.emit('letEveryoneKnowIjoined')
  }, [])
  
  return <Component {...pageProps} socket={socket} />
}

export default MyApp
