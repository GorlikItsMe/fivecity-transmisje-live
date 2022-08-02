import { Data as CharactersApiResponse } from "../pages/api/v1/characters";
import TwitchEasy from "twitch-easy";
import pLimit from "p-limit";
import {
  StreamerByName,
  StreamerOnline,
} from "twitch-easy/lib/types/twitchAPI";

const clientId = process.env.TWITCH_API_CLIENT_ID ?? "";
const clientSecret = process.env.TWITCH_API_CLIENT_SECRET ?? "";
const GTA = "Grand Theft Auto V";
const api = new TwitchEasy(clientId, clientSecret);
const limit = pLimit(50);

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
}

function getStreamerByName(
  name: string,
  maxRetry: number = 3
): Promise<StreamerByName | null> {
  return api.getStreamerByName(name).catch((error: Error) => {
    console.log("getStreamerByName", error.message, maxRetry);
    if (maxRetry > 0) {
      return getStreamerByName(name, maxRetry - 1);
    }
    throw error;
  });
}

function getStreamerOnline(
  id: string,
  maxRetry: number = 3
): Promise<StreamerOnline | null> {
  return api.getStreamerOnline(id).catch((error) => {
    console.log("getStreamerOnline", error.message, maxRetry);
    if (maxRetry > 0) {
      return getStreamerOnline(id, maxRetry - 1);
    }
    throw error;
  });
}

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

export async function getFiveCityStreamers(hostname: string) {
  const apiCharactersUrl = `http://${hostname}/api/v1/characters`;

  const [characters, _] = await Promise.all([
    fetch(apiCharactersUrl).then(
      (r) => r.json() as Promise<CharactersApiResponse>
    ),
    getStreamerByName("ewroon"), // first call to api will generate OAuth token
  ]);

  let twitchStreamers = characters
    .map((p) => p.socialLinks.twitch)
    .filter(notEmpty);
  twitchStreamers = twitchStreamers.filter(
    (c, i) => twitchStreamers.indexOf(c) === i
  );
  console.log(`Sprawdzam ${twitchStreamers.length} Streamerów...`);

  const data = twitchStreamers.map((twitchUrl) => {
    return limit(async () => {
      const myCharList = characters.filter(
        (c) => c.socialLinks.twitch === twitchUrl
      );

      const channelName = twitchUrl.replace("https://www.twitch.tv/", "");
      const s = await getStreamerByName(channelName);
      //   const s = await api.getStreamerByName(channelName);
      let viewerCount = 0;
      let isLive = false;

      if (s?.is_live ?? false) {
        if (s?.game_name === GTA) {
          // nie wszyscy mają odpowiednie tytuły no ale trudno nic z tym nie zrobimy
          const whitelist = ["[5city]", "5city", "fivecity", "5miasto"];
          const blacklist = ["77rp"];

          let isBad = false;
          for (let i = 0; i < blacklist.length; i++) {
            const badWord = blacklist[i];
            if (s.title.toLowerCase().includes(badWord.toLowerCase())) {
              isLive = false;
              viewerCount = 0;
              isBad = true;
              break;
            }
          }

          if (!isBad) {
            for (let i = 0; i < whitelist.length; i++) {
              const goodWord = whitelist[i];
              if (s.title.toLowerCase().includes(goodWord.toLowerCase())) {
                isLive = true;
                // const liveInfo = await api.getStreamerOnline(`${s?.id}`);
                const liveInfo = await getStreamerOnline(`${s?.id}`);
                viewerCount = liveInfo?.viewer_count ?? 0;
                break;
              }
            }
          }

          // console.log(isLive ? "✔️" : "❌", liveTitle);
        }
      }

      let d: StreamerData;
      d = {
        image: s?.thumbnail_url ?? "",
        name: s?.display_name ?? "",
        socialMedia: {
          twitch: myCharList[0].socialLinks.twitch,
          twitter: myCharList[0].socialLinks.twitter,
          instagram: myCharList[0].socialLinks.instagram,
          youtube: myCharList[0].socialLinks.youtube,
          facebook: myCharList[0].socialLinks.facebook,
        },
        viewerCount: viewerCount,
        isLive: isLive,

        characters: myCharList.map((c) => {
          return {
            name: c.name,
            wikiLink: c.wikiLink,
            image: c.image,
          };
        }),
      };
      return d;
    });
  });

  const streamersList = await Promise.all(data);

  const sortedList = streamersList
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

  console.log(`Znaleziono ${sortedList.length} StreamerData`);
  return sortedList;
}
