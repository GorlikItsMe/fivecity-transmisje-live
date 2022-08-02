import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/NewHome.module.scss";
import FiveCityLogo from "../public/FiveCityLogo.svg";
import { useEffect, useState } from "react";
import { Data as ApiStreamersData } from "./api/v1/streamers";
import { MainStreamerCard } from "../components/MainStreamerCard";

const Home: NextPage = () => {
  const [stremersList, setStreamersList] = useState<ApiStreamersData>([]);

  useEffect(() => {
    const loop = setInterval(() => {
      fetch("/api/v1/streamers")
        .then((r) => r.json())
        .then((r) => setStreamersList(r));
    }, 60000);
    return () => clearInterval(loop);
  }, []);

  const onlineStreamers = stremersList.filter((s) => s.isLive);

  const isLoading = stremersList.length === 0;

  return (
    <div className={styles.container}>
      <Head>
        <title>Fivecity transmisje live</title>
        <meta name="description" content="Fivecity transmisje live" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.centerWrapper}>
          <h1 className={styles.title}>
            <Image
              src={FiveCityLogo}
              height="50px"
              width="140px"
              alt="Fivecity logo"
            />{" "}
            transmisje live
          </h1>
          {isLoading && <p>Ładowanie...</p>}
        </div>

        {!isLoading && (
          <>
            <MainStreamerCard streamersList={onlineStreamers} />
            <br />
            <p>Pełna lista postaci wkrótce</p>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="https://github/GorlikItsMe/fivecity-transmisje-live">Github</a>
        <a href="https://5city.fandom.com/pl/">5city.fandom.com</a>
        <a href="https://discord.com/invite/jz6XhRry">Discord</a>
        <a href="https://5city.fandom.com/pl/" className={styles.right}>
          Podziękowania dla redaktorów 5city.fandom.com
        </a>
      </footer>
    </div>
  );
};

export default Home;
