import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import { toast } from "react-toastify";
import { MdStart, MdSearch } from "react-icons/md";
// import ParticlesComponent from "../components/ParticlesComponent";
// import ProompterLogo from "../components/svg/proompter.png";
// import proompterSVG from "./../public/proompter.svg";

export default function Home({ socket }) {
  const router = useRouter();

  useEffect(() => {
    socket.on("createdRoomSuccessfully", (room) => {
      setTimeout(() => {
        console.log("Pushed");
        router.push(`/room/${room.users[0].id}`);
      }, 3000);
    });
  }, []);

  const createRoom = () => {
    socket.emit("createRoom", localStorage.getItem("nickname"));
  };

  return (
    <Layout>
      <Head>
        <title>Proompter</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="wrapperHomepage">
        {/* <ParticlesComponent /> */}
        <div className="title">
          <img src="/proompter.png" alt="Proompter" width={550} style={{ padding: "20px" }} />
          {/* <img src={proompterSVG} alt="Your SVG" /> */}
          {/* <div>Proompter</div> */}
          {/* <img src={ProompterLogo} /> */}
          {/* <ProompterSVG style={{ fontSize: 300 }} alt="Proompter" /> */}
        </div>

        <div>
          <button onClick={() => createRoom()} className="button">
            <MdStart size="22px" />
            <div>Create New Room</div>
          </button>

          <button className="button" onClick={() => toast.error("Not available yet")}>
            <MdSearch size="22px" />
            <div>Join Opened Room</div>
          </button>
        </div>
      </div>
      <style jsx>{`
        .title {
          padding: 15px;
          margin-bottom: 10px;
          transition: box-shadow 350ms;
        }

        @keyframes flashSlide {
          from {
            left: -25%;
            opacity: 1;
          }
          to {
            left: 120%;
            opacity: 0;
          }
        }

        .title {
          position: relative;
          overflow: hidden;
        }

        .title:hover {
          box-shadow: 0px 0px 11px 0px #777777;
        }
        .title:hover::after {
          animation-name: flashSlide;
          animation-duration: 4s;
        }
        .title::after {
          content: "";
          background-color: #acacac24;
          width: 30px;
          height: 170%;
          position: absolute;
          top: -34%;
          left: -25%;
          transform: rotate(45deg);
          box-shadow: 0 0 1px 1px #f7f7f7;
        }
        #wrapperHomepage {
          position: relative;
          background: #303030;
          height: 100vh;
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
        }

        #wrapperHomepage > div:last-child {
          display: flex;
          width: 80%;
          justify-content: space-around;
        }
        .button {
          color: #dedede;
          padding: 15px 32px;
          font-size: 20px;
          cursor: pointer;
          margin: 15px;
          border: 2px solid #ffec4859;
          background: unset;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
        .button div {
          margin-left: 10px;
        }
        .button:hover {
          background-color: #eece86;
          color: black;
        }
        @media only screen and (max-width: 780px) {
          #wrapperHomepage > div:last-child {
            flex-direction: column;
            width: 90% !important;
          }
        }
      `}</style>
    </Layout>
  );
}
