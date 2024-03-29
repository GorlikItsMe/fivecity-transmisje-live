import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/NewHome.module.scss";
import FiveCityLogo from "../public/FiveCityLogo.svg";
import { useEffect, useState } from "react";
import { Data as ApiStreamersData } from "./api/v1/streamers";
import { MainStreamerCard } from "../components/MainStreamerCard";

const isDebug = process.env.NEXT_PUBLIC_DEBUG?.toLowerCase() == "true" ?? false;
const apiUrl = isDebug
  ? "https://5miasto.pl/api/v1/streamers_live"
  : "/api/v1/streamers_live";

const Home: NextPage = () => {
  const [streamersList, setStreamersList] = useState<ApiStreamersData | null>(
    null
  );

  useEffect(() => {
    fetch(apiUrl)
      .then((r) => r.json())
      .then((r) => setStreamersList(r));

    const loop = setInterval(() => {
      fetch(apiUrl)
        .then((r) => r.json())
        .then((r) => setStreamersList(r));
    }, 60000);
    return () => clearInterval(loop);
  }, []);

  const isLoading = streamersList === null;

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
              height="50"
              width="140"
              alt="Fivecity logo"
            />{" "}
            transmisje live
          </h1>
          {isLoading && <p>Ładowanie...</p>}
        </div>
        {!isLoading && streamersList.length == 0 && (
          <div style={{ textAlign: "center" }}>
            <p>Aktualnie nikt nie streamuje {":-("}</p>
            <p>
              Ale jeżeli szukasz informacji o odgrywanych postaciach to
              zapraszam
            </p>
            <a href="https://5city.fandom.com/pl/">5city.fandom.com</a>
          </div>
        )}
        {!isLoading && streamersList.length != 0 && (
          <>
            <MainStreamerCard streamersList={streamersList} />
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/GorlikItsMe/fivecity-transmisje-live">
          Github
        </a>
        <a href="https://5city.fandom.com/pl/">5city.fandom.com</a>
        <a href="https://discord.gg/twTUD4qpFx">Discord</a>
        <a href="https://5city.fandom.com/pl/" className={styles.right}>
          Podziękowania dla redaktorów 5city.fandom.com
        </a>
      </footer>
    </div>
  );
};

export default Home;
