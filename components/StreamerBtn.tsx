import Image from "next/image";
import { StreamerData } from "../lib/getFiveCityStreamers";
import { blurDataURL } from "../lib/imageBlur";
import styles from "../styles/MainStreamerCard.module.scss";

export function StreamerBtn({
  streamer,
  onClick,
  isSelected,
}: {
  streamer: StreamerData;
  onClick: () => void;
  isSelected: boolean;
}) {
  const klass = `${styles.streamerBtn} ${isSelected ? styles.isSelected : ""}`;
  return (
    <div className={klass} onClick={onClick}>
      <Image
        src={streamer.image}
        width={"50px"}
        height={"50px"}
        layout="intrinsic"
        alt={streamer.name}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
      <span className={styles.name}>{streamer.name}</span>
    </div>
  );
}
