import "../styles/globals.css";
import socket from "../components/socketio/socket";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} socket={socket} />;
}

export default MyApp;
