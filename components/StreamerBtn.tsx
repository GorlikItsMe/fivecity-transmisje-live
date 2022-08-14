import Image from "next/image";
import { useEffect, useRef } from "react";
import { StreamerData } from "../lib/getFiveCityStreamers";
import { blurDataURL } from "../lib/imageBlur";
import styles from "../styles/MainStreamerCard.module.scss";

function StreamViewerIcon() {
  return (
    <figure className={styles.streamviewericon}>
      <svg
        type="color-text-accessible-red"
        width="20px"
        height="20px"
        version="1.1"
        viewBox="0 0 20 20"
        x="0px"
        y="0px"
      >
        <g>
          <path
            fillRule="evenodd"
            d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"
            clipRule="evenodd"
          ></path>
        </g>
      </svg>
    </figure>
  );
}
export function StreamerBtn({
  streamer,
  onClick,
  isSelected,
}: {
  streamer: StreamerData;
  onClick: () => void;
  isSelected: boolean;
}) {
  const streamerNameRef = useRef<HTMLSpanElement>(null);

  // change font size for large nicknames
  useEffect(() => {
    if (streamerNameRef.current) {
      const defaultFontSize = parseInt(
        window
          .getComputedStyle(streamerNameRef.current)
          .fontSize.replace("px", "")
      );
      const delta = streamerNameRef.current.clientWidth - 130;
      if (delta > 0) {
        const magic = Math.round(delta / 10);
        streamerNameRef.current.style.fontSize = `${defaultFontSize - magic}px`;
      }
    }
  }, [streamerNameRef]);

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
      <span className={styles.name} ref={streamerNameRef}>
        {streamer.name}
      </span>
      <span className={styles.viewerCount}>
        <StreamViewerIcon /> {streamer.viewerCount}
      </span>
    </div>
  );
}
