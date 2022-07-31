import Image from "next/image";
import styles from "../styles/CharacterCard.module.scss";
import { StreamerData } from "../pages/api/all_streamers";
import unknownCharacter from "../public/images/unknown_character.jpg";

function SocialMediaList_OLD({ streamer }: { streamer: StreamerData }) {
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

function SocialMediaList({ streamer }: { streamer: StreamerData }) {
  function getName(url: string) {
    const c = url.split("/");
    const name1 = c[c.length - 1];
    const name2 = c[c.length - 2];
    const name = name1 || name2;
    return name;
  }
  return (
    <div className={styles.socialMediaList}>
      {streamer.socialLinks.twitch && (
        <a
          className={styles.socialMediaLink}
          href={streamer.socialLinks.twitch}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <i className="fa-brands fa-twitch fa-lg" />
            {getName(streamer.socialLinks.twitch)}
          </div>
        </a>
      )}
      {streamer.socialLinks.instagram && (
        <a
          className={styles.socialMediaLink}
          href={streamer.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <i className="fa-brands fa-instagram fa-lg" />
            {getName(streamer.socialLinks.instagram)}
          </div>
        </a>
      )}
      {streamer.socialLinks.twitter && (
        <a
          className={styles.socialMediaLink}
          href={streamer.socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <i className="fa-brands fa-twitter fa-lg" />
            {getName(streamer.socialLinks.twitter)}
          </div>
        </a>
      )}
    </div>
  );
}

export function CharacterCard({ streamer }: { streamer: StreamerData }) {
  // const twitchEmbedLink = `https://embed.twitch.tv?autoplay=false&channel=${streamer.twitchTvName}&height=480&parent=localhost&referrer=http%3A%2F%2Flocalhost%3A3000%2F&theme=dark&width=854`
  const twitchEmbedLink = `https://embed.twitch.tv?autoplay=false&channel=${streamer.twitchTvName}&parent=localhost&theme=dark&width=854&height=480`;
  const isLive =
    streamer.isLive && streamer.isFiveCity && streamer.twitchTvName;

  return (
    <div
      className={`${styles.characterBox} ${
        isLive ? styles.isLive : styles.isOffline
      }`}
    >
      <div className={styles.imageRow}>
        <Image
          src={streamer.image ?? unknownCharacter}
          width="128px"
          height="250px"
          alt="gta5 character"
          objectFit="cover"
          sizes="(max-width: 128px) 100vw, 128px"
        />
        {isLive && (
          <div className={styles.leftRowInfo}>
            <a href={streamer.wikiLink}>
              <h2 className={styles.characterName}>{streamer.name}</h2>
            </a>
            <SocialMediaList streamer={streamer} />
          </div>
        )}
      </div>
      <div className={styles.characterInfo}>
        {!isLive && (
          <>
            <a href={streamer.wikiLink}>
              <h2 className={styles.characterName}>{streamer.name}</h2>
            </a>
            <SocialMediaList streamer={streamer} />
          </>
        )}
        {isLive && (
          <div>
            <iframe
              src={twitchEmbedLink}
              allowFullScreen
              scrolling="no"
              allow="autoplay; fullscreen"
              title="Twitch"
              sandbox="allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
              width="854"
              height="480"
              frameBorder="0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
