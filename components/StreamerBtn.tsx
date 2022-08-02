import Image from "next/image";
import { StreamerData } from "../lib/getFiveCityStreamers";
import styles from "../styles/MainStreamerCard.module.scss";

export function StreamerBtn({
  streamer,
  onClick,
}: {
  streamer: StreamerData;
  onClick: () => void;
}) {
  return (
    <div className={styles.streamerBtn} onClick={onClick}>
      <Image
        src={streamer.image}
        width={"50px"}
        height={"50px"}
        layout="intrinsic"
        alt={streamer.name}
      />
      <span className={styles.name}>{streamer.name}</span>
    </div>
  );
}
