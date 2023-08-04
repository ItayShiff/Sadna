import React from "react";
import Layout from "../components/layout";
import Image from "next/image";
import Head from "next/head";
import styles from "../styles/about.module.css";

function About() {
  return (
    <Layout>
      <Head>
        <title>About Us | Proompter</title>
      </Head>
      <div id="wrapperForCentering">
        <div id="wrapperHomepage">
          <div>
            <div>
              <div className={styles.titles}>Creators & Developers:</div>
              <div id={styles.imagesDevelopersWrapper}>
                <div>
                  <Image
                    src="/DANIEL.jpeg"
                    alt="Daniel Senderovych"
                    width="350"
                    height="350"
                    className={styles.imagesDevelopers}
                  />
                  <div>Daniel Senderovych</div>
                </div>
                <div>
                  <Image src="/itay.jpeg" alt="Itay Shiff" width="350" height="350" className={styles.imagesDevelopers} />
                  <div>Itay Shiff</div>
                </div>
                <div>
                  <Image
                    src="/ROMAN.png"
                    alt="Roman Vitvitsky"
                    width="350"
                    height="350"
                    className={styles.imagesDevelopers}
                  />
                  <div>Roman Vitvitsky</div>
                </div>
              </div>
            </div>
            <div>
              <div className={styles.titles}>About the game</div>
              <div>
                Proompter is an innovative multiplayer game designed to ignite your imagination and challenge your creative
                prowess. In this exciting virtual experience, players are invited to join a room where they are presented
                with two random words. Armed with these words, players must craft a unique prompt or query that incorporates
                both terms. This prompt sets the stage for an artistic showcase where stunning images are generated based on
                each player's input. After the images are revealed, players have the opportunity to select their favorite
                one. Finally, a thrilling voting phase commences, allowing participants to cast their votes for the most
                impressive image. The player with the highest number of votes emerges as the ultimate victor of Proompter.
                Step into Proompter's world today and let your creativity soar.
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        #wrapperHomepage {
          width: 100%;
          padding: 20px 0px;
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          color: #d4d4d4;
          background: #3f3f3f;
          font-size: 18px;
        }
        #wrapperForCentering {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        #wrapperHomepage > div:last-child {
          display: flex;
          width: 80%;
          justify-content: space-around;
        }
        @media only screen and (min-width: 1267px) {
          #wrapperHomepage > div:last-child > div:first-child {
            margin-right: 50px;
          }
        }
        @media only screen and (max-width: 1266px) {
          #wrapperHomepage > div:last-child {
            flex-direction: column;
          }
        }

        @media screen and (max-width: 1200px) {
          #wrapperForCentering {
            display: block;
            margin-top: 45px;
          }
          #wrapperHomepage {
            background: #303030;
          }
        }

        @media screen and (max-width: 712px) {
          #wrapperHomepage > div:last-child {
            width: 95%;
          }
        }

        @media screen and (max-width: 530px) {
          #wrapperHomepage,
          .titles {
            font-size: 16px;
          }
        }
      `}</style>
    </Layout>
  );
}

export default About;
