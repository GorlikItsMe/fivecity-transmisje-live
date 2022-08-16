import { useEffect, useState } from "react";
import { StreamerData } from "../lib/getFiveCityStreamers";
import styles from "../styles/MainStreamerCard.module.scss";
import { CharacterInfoCard } from "./CharacterInfoCard";
import { StreamerBtn } from "./StreamerBtn";
import Scrollbar from "react-scrollbars-custom";

type Props = {
  streamersList: StreamerData[];
};
export function MainStreamerCard({ streamersList }: Props) {
  const onlineStreamers = streamersList.filter((s) => s.isLive);
  const [streamerName, setStreamerName] = useState<string | null>(null);

  useEffect(() => {
    if (streamerName == null) {
      setStreamerName(streamersList[0].name);
    }
  }, [streamerName, streamersList]);
  const hostname = window.location.hostname;
  const isMobile = window.innerWidth <= 1130;

  const twitchEmbedLink =
    streamerName && !isMobile
      ? `https://player.twitch.tv/?channel=${streamerName}&parent=${hostname}&autoplay=false&theme=dark&width=854&height=480`
      : "about:blank";

  const streamer = streamersList.find((s) => s.name === streamerName) ?? null;

  function changeStream(s: StreamerData) {
    const isMobile = window.innerWidth <= 1130;
    if (isMobile) {
      window.gtag("event", "change_stream", {
        event_category: "mobile",
        event_label: s.name,
      });
      // open in new tab twitch link
      if (s.socialMedia.twitch) {
        window.open(s.socialMedia.twitch, "_blank");
      }
    } else {
      window.gtag("event", "change_stream", {
        event_category: "desktop",
        event_label: s.name,
      });
      // change iframe link
      setStreamerName(s.name);
    }
  }

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
          <Scrollbar style={{ height: "120px" }}>
            <div className={styles.characterList}>
              {streamer?.characters.map((c) => (
                <CharacterInfoCard key={c.name} character={c} />
              ))}
            </div>
          </Scrollbar>
        </div>
      </div>
      <div className={styles.streamersList}>
        <Scrollbar style={{ height: "600px" }}>
          {onlineStreamers.map((streamer) => (
            <StreamerBtn
              key={streamer.name}
              streamer={streamer}
              onClick={() => changeStream(streamer)}
              isSelected={streamer.name == streamerName}
            />
          ))}
        </Scrollbar>
      </div>
    </div>
  );
}
