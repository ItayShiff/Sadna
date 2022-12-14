import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function Home({ socket }) {
  const router = useRouter();

  useEffect(() => {
    socket.on("createdRoomSuccessfully", (room) => {
      // console.log(room);
      router.push(`/room/${room.users[0].id}`);
    });
  }, []);

  const createRoom = () => {
    socket.emit("createRoom", localStorage.getItem("nickname"));
  };

  return (
    <Layout>
      <Head>
        <title>Sadna Game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="title">
          <div>Sadna Game</div>
        </div>

        <button onClick={() => createRoom()}>Create room</button>
      </main>

      <footer>
        <Link href="/daniel">Go to daniel page</Link>
      </footer>
      <style jsx>{`
        .title {
          color: red;
          font-weight: bold;
          text-align: center;
        }
      `}</style>
    </Layout>
  );
}
