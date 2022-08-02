import Image from "next/image";
import { CharacterData } from "../lib/getFiveCityStreamers";
import styles from "../styles/MainStreamerCard.module.scss";
import unknownCharacter from "../public/images/unknown_character.jpg";

export function CharacterInfoCard({ character }: { character: CharacterData }) {
  return (
    <a href={character.wikiLink} target="_blank" rel="noreferrer">
      <div className={styles.characterInfoCard}>
        <div className={styles.characterImage}>
          <Image
            src={character.image ?? unknownCharacter}
            width={"70px"}
            height={"100px"}
            objectFit="cover"
            sizes="(max-width: 70px) 100vw, 70px"
            alt={character.name}
          />
        </div>

        <div className={styles.rightRow}>
          <div className={styles.name}>{character.name}</div>
        </div>
      </div>
    </a>
  );
}
