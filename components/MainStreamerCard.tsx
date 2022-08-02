import { useEffect, useState } from "react";
import { StreamerData } from "../lib/getFiveCityStreamers";
import styles from "../styles/MainStreamerCard.module.scss";
import { CharacterInfoCard } from "./CharacterInfoCard";
import { StreamerBtn } from "./StreamerBtn";

type Props = {
  streamersList: StreamerData[];
};
export function MainStreamerCard({ streamersList }: Props) {
  const [streamerName, setStreamerName] = useState<string | null>(null);

  useEffect(() => {
    if (streamerName == null) {
      setStreamerName(streamersList[0].name);
    }
  }, [streamerName, streamersList]);
  const hostname = window.location.hostname;
  const twitchEmbedLink = streamerName
    ? `https://player.twitch.tv/?channel=${streamerName}&parent=${hostname}&autoplay=false&theme=dark&width=854&height=480`
    : "about:blank";

  const streamer = streamersList.find((s) => s.name === streamerName) ?? null;

  return (
    <div className={styles.card}>
      <div className={styles.main}>
        <iframe
          className={styles.streamPlayer}
          src={twitchEmbedLink}
          allowFullScreen
          scrolling="no"
          allow="autoplay; fullscreen"
          width="854"
          height="480"
          frameBorder="0"
        />
        <div className={styles.characterList}>
          {streamer?.characters.map((c) => (
            <CharacterInfoCard key={c.name} character={c} />
          ))}
        </div>
      </div>
      <div className={styles.streamersList}>
        {streamersList.map((streamer) => (
          <StreamerBtn
            key={streamer.name}
            streamer={streamer}
            onClick={() => {
              setStreamerName(streamer.name);
            }}
          />
        ))}
      </div>
    </div>
  );
}
