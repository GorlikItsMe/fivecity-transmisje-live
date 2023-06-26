import Image from "next/image";
import { CharacterData } from "../lib/getFiveCityStreamers";
import styles from "../styles/MainStreamerCard.module.scss";
import unknownCharacter from "../public/images/unknown_character.jpg";
import { blurDataURL } from "../lib/imageBlur";

export function CharacterInfoCard({ character }: { character: CharacterData }) {
  const words = character.name.split(" ");
  const FancyName = words.length == 2 ? words.join("\n") : character.name;

  return (
    <a href={character.wikiLink} target="_blank" rel="noreferrer">
      <div className={styles.characterInfoCard}>
        <div className={styles.characterImage}>
          <Image
            src={character.image ?? unknownCharacter}
            width="70"
            height="100"
            objectFit="cover"
            sizes="(max-width: 70px) 100vw, 70px"
            alt={character.name}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        </div>

        <div className={styles.rightRow}>
          <div className={styles.name}>{FancyName}</div>
        </div>
      </div>
    </a>
  );
}
