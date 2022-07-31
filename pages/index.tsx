import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fivecity transmisje live</title>
        <meta name="description" content="Fivecity transmisje live" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Fivecity transmisje live</h1>

        <p className={styles.description}>
          <a href="/api/fivecity_streamers">/api/fivecity_streamers</a>
          <div>
            Podziękowania dla twórców wiki (
            <a href="https://5city.fandom.com/">5city.fandom.com</a>) bo to
            dzięki nim mam linki do wszystkich twórców
          </div>
          <div>&nbsp;</div>
          <div>Ładne UI wkrótce</div>
          <a href="https://github/GorlikItsMe/nazwarepo">Repozytorium na github kliknij tutaj</a>
        </p>

        <div id="twitch-embed"></div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
