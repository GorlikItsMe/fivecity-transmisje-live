import Image from "next/image";
import styles from "../styles/CharacterCard.module.scss";
import { StreamerData } from "../pages/api/all_streamers";
import { useEffect } from "react";

function SocialMediaList({ streamer }: { streamer: StreamerData }) {
  return (
    <div className={styles.socialMediaList}>
      {streamer.socialLinks.twitch && (
        <a
          href={streamer.socialLinks.twitch}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-twitch fa-lg" />
        </a>
      )}
      {streamer.socialLinks.youtube && (
        <a
          href={streamer.socialLinks.youtube}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-youtube fa-lg"></i>
        </a>
      )}
      {streamer.socialLinks.instagram && (
        <a
          href={streamer.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-instagram fa-lg" />
        </a>
      )}
      {streamer.socialLinks.twitter && (
        <a
          href={streamer.socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-twitter fa-lg" />
        </a>
      )}
    </div>
  );
}

export function CharacterCard({ streamer }: { streamer: StreamerData }) {
    useEffect(() => {

    }, [])
  return (
    <div className={styles.characterBox}>
      <div className={styles.imageRow}>
        <Image
          src={streamer.image ?? ""}
          height="150px"
          width="128px"
          alt="gta5 character"
          objectFit="cover"
        />
      </div>
      <div className={styles.characterInfo}>
        <a href={streamer.wikiLink}>
          <h2 className={styles.characterName}>{streamer.name}</h2>
        </a>
        <SocialMediaList streamer={streamer} />
        <div id={`twitch-embed_${streamer.name}`}></div>
      </div>
    </div>
  );
}
