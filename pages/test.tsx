import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/NewHome.module.scss";
import FiveCityLogo from "../public/FiveCityLogo.svg";
import { getAllFiveCityCharacters } from "../lib/getAllFiveCityCharacters";

const Home: NextPage = ({
  characters,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
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
          <p>Ładowanie...</p>
        </div>

        <p>Tak naprawde to nic sie nie ładuje bo dopiero robię tą stronę</p>
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

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      characters: await getAllFiveCityCharacters(),
    },
  };
};

export default Home;
