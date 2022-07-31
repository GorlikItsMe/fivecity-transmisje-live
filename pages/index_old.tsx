import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CharacterCard } from "../components/CharacterCard";
import styles from "../styles/Home.module.css";
import { Data as ApiData } from "./api/fivecity_streamers";
import FiveCityLogo from "../public/FiveCityLogo.svg";

const Home: NextPage = () => {
  const [streamersList, setStreamersList] = useState<ApiData | null>(null);
  useEffect(() => {
    fetch("/api/fivecity_streamers")
      .then((res) => res.json())
      .then((data) => setStreamersList(data));
  }, []);

  const streamersOnline = streamersList?.filter((streamer) => {
    if (streamer.isLive && streamer.isFiveCity && streamer.twitchTvName) {
      return true;
    }
    return false;
  });
  const streamersOffine = streamersList?.filter((streamer) => {
    if (streamer.isLive && streamer.isFiveCity && streamer.twitchTvName) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Fivecity transmisje live</title>
        <meta name="description" content="Fivecity transmisje live" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <Image
            src={FiveCityLogo}
            height="50px"
            width="140px"
            alt="Fivecity logo"
          />{" "}
          transmisje live
        </h1>

        {!streamersList && <h2>Ładowanie...</h2>}
        <div id="live">
          {streamersOnline &&
            streamersOnline.map((streamer, i) => (
              <CharacterCard streamer={streamer} key={i} />
            ))}
        </div>
        <div id="offline" className={styles.offlineStreamers}>
          {streamersOffine &&
            streamersOffine.map((streamer, i) => (
              <CharacterCard streamer={streamer} key={i} />
            ))}
        </div>
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
        <a
          href="https://github/GorlikItsMe/fivecity-transmisje-live"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
        <a href="https://5city.fandom.com/">
          Podziękowania dla redaktorów 5city.fandom.com
        </a>
      </footer>
    </div>
  );
};

export default Home;
