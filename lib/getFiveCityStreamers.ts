import { Data as CharactersApiResponse } from "../pages/api/v1/characters";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient, HelixStream } from "@twurple/api";
import { join } from "path";
import { readFileSync } from "fs";
import { TwitchCachedUser } from "./getTwitchUsersData";
import { notEmpty } from "./notEmpty";
import streamersWhitelistRaw from "../data/streamersWhitelist.json";
import { createLogger } from "./logger";

const logger = createLogger("getFiveCityStreamers");

const streamersWhitelist: string[] = streamersWhitelistRaw;

const clientId = process.env.TWITCH_API_CLIENT_ID ?? "";
const clientSecret = process.env.TWITCH_API_CLIENT_SECRET ?? "";

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const api = new ApiClient({ authProvider });

const GTA = "Grand Theft Auto V";
const ART = "Art";
const GAMENAMELIST = [GTA, ART];

export type CharacterData = {
  name: string;
  wikiLink: string;
  image: string | null;
};
export type StreamerData = {
  image: string;
  name: string;
  socialMedia: {
    twitch: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
    facebook: string | null;
  };
  viewerCount: number;
  isLive: boolean;

  characters: CharacterData[];
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks = [];
  // items = [].concat(...items)  // typescript dont like it but all works without it soo why it is here?
  while (items.length) {
    chunks.push(items.splice(0, size));
  }
  return chunks;
}

function getIsFiveCityLive(
  isLive: boolean,
  stream: HelixStream | null,
  channelName: string
) {
  if (!isLive) {
    return false;
  }
  if (!stream) {
    return false;
  }
  if (!GAMENAMELIST.includes(stream.gameName)) {
    return false;
  }
  const sTitle = stream.title;

  // nie wszyscy mają odpowiednie tytuły no ale trudno nic z tym nie zrobimy
  const whitelist = ["[5city]", "5city", "fivecity", "5miasto", "5stadt", "5 city"];
  const blacklist = ["77rp", "ExileRP", "pixarp", "adrenalinarp", "pixa", "cocorp", "nopixel"];

  for (let i = 0; i < blacklist.length; i++) {
    const badWord = blacklist[i];
    if (sTitle.toLowerCase().includes(badWord.toLowerCase())) {
      return false; // bad word detected
    }
  }

  for (let i = 0; i < whitelist.length; i++) {
    const goodWord = whitelist[i];
    if (sTitle.toLowerCase().includes(goodWord.toLowerCase())) {
      return true; // success
    }
  }

  const isWhitelisted =
    streamersWhitelist.find(
      (v) => v.toLowerCase() == channelName.toLowerCase()
    ) !== undefined;
  if (isWhitelisted) {
    return true; // whitelisted soo only check is he play gta v
  }

  // Nie mogę być pewny czy to jest live z FiveCity czy z innego serwera GTA RP
  return false;
}

export async function getFiveCityStreamers() {
  const start_dt = new Date().getTime();

  const characters: CharactersApiResponse = JSON.parse(
    readFileSync(join(process.cwd(), "data", "characters.json"), {
      encoding: "utf8",
    })
  );
  const twitchCachedUserList: TwitchCachedUser[] = JSON.parse(
    readFileSync(join(process.cwd(), "data", "twitchCachedUsersData.json"), {
      encoding: "utf8",
    })
  );

  // first call to api will generate OAuth token
  logger.info("Sprawdz czy OAuth token działa");
  await api.users.getUserByName("ewroon");

  logger.info("Stwórz listę streamerów twitch");
  let twitchStreamers = characters
    .map((p) => p.socialLinks.twitch)
    .filter(notEmpty);
  twitchStreamers = twitchStreamers.filter(
    (c, i) => twitchStreamers.indexOf(c) === i
  );
  logger.info(`Będę sprawdzał ${twitchStreamers.length} Streamerów...`);

  // dane o kontach twitch
  const chunked = chunk(twitchStreamers, 50);

  logger.info("Stwórz listę kont twitch");
  const twitchUserList = await Promise.all(
    chunked.map(async (thisChunk) => {
      // lista loginów
      const streamersUsernameList = thisChunk.map((twitchUrl) => {
        return twitchUrl.replace("https://www.twitch.tv/", "");
      });

      // sprawdz czy mam je w cache
      const streamersUserList: TwitchCachedUser[] = [];
      const streamersUsernameNotFoundInCacheList: string[] = [];

      streamersUsernameList.forEach((channelName) => {
        let user =
          twitchCachedUserList.find(
            (v) => v.displayName.toLowerCase() == channelName.toLowerCase()
          ) ?? null;
        if (user) {
          // found in cache
          streamersUserList.push(user);
        } else {
          // not found in cache
          logger.warn(` ${channelName} not found in cache`);
          streamersUsernameNotFoundInCacheList.push(channelName);
        }
      });

      // pobierz na raz informacje o wielu streamerach
      const fetchedUsers = await api.users.getUsersByNames(
        streamersUsernameNotFoundInCacheList
      );
      return streamersUserList.concat(fetchedUsers);
    })
  );

  logger.info("Pobierz informacje o obecnie prowadzonych transmisjach");
  const dataList = await Promise.all(
    twitchUserList.map(async (twitchUserList) => {
      const userIdList = twitchUserList.map((v) => v.id);
      const streamList = await api.streams.getStreamsByUserIds(userIdList);

      return twitchUserList.map((user) => {
        const myCharList = characters.filter(
          (c) =>
            c.socialLinks.twitch?.toLowerCase() ===
            `https://www.twitch.tv/${user.displayName}`.toLowerCase()
        );

        const stream = streamList.find((s) => s.userId == user.id) ?? null;
        let isLive = stream !== null;
        const isFiveCityLive = getIsFiveCityLive(
          isLive,
          stream,
          user.displayName
        );
        const viewerCount = stream?.viewers ?? 0;

        return {
          image: user.profilePictureUrl,
          name: user.displayName,
          socialMedia: {
            twitch: myCharList[0].socialLinks.twitch,
            twitter: myCharList[0].socialLinks.twitter,
            instagram: myCharList[0].socialLinks.instagram,
            youtube: myCharList[0].socialLinks.youtube,
            facebook: myCharList[0].socialLinks.facebook,
          },
          viewerCount: isFiveCityLive ? viewerCount : 0,
          isLive: isFiveCityLive,

          characters: myCharList.map((c) => {
            return {
              name: c.name,
              wikiLink: c.wikiLink,
              image: c.image,
            };
          }),
        };
      });
    })
  );

  const esdl: StreamerData[] = []; // fix for typescript
  const streamersList: StreamerData[] = esdl.concat(...dataList);

  const sortedList = streamersList
    .filter(notEmpty)
    .filter((sd) => sd.name !== "")
    .sort((a, b) => {
      if (a.isLive && !b.isLive) {
        return -1;
      }
      if (!a.isLive && b.isLive) {
        return 1;
      }
      if (a.viewerCount > b.viewerCount) {
        return -1;
      }
      if (a.viewerCount < b.viewerCount) {
        return 1;
      }

      // alphabetical order
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

  logger.info(`Znaleziono ${sortedList.length} StreamerData`);
  const end_dt = new Date().getTime();
  logger.info(
    `Wygenerowano w: ${end_dt - start_dt}ms -> ${
      (end_dt - start_dt) / 1000
    }sek -> AVG per Streamer ${(end_dt - start_dt) / streamersList.length}`
  );
  return sortedList;
}
