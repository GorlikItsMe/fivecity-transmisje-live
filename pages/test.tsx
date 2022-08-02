import Head from "next/head";
import Image from "next/image";
import styles from "../styles/NewHome.module.scss";
import FiveCityLogo from "../public/FiveCityLogo.svg";
import { useEffect, useState } from "react";
import { Data as ApiStreamersData } from "./api/v1/streamers";

export default function TestPage() {
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
          <div>
            {onlineStreamers.map((s, i) => (
              <p key={i}>
                <a href={s.socialMedia.twitch ?? "#"}>{s.name}</a>
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
