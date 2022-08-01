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
const limit = pLimit(100);

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
}

function getStreamerByName(
  name: string,
  maxRetry: number = 3
): Promise<StreamerByName | null> {
  try {
    return api.getStreamerByName(name);
  } catch (error) {
    if (maxRetry > 0) {
      return getStreamerByName(name, maxRetry - 1);
    }
    throw error;
  }
}

function getStreamerOnline(
  id: string,
  maxRetry: number = 3
): Promise<StreamerOnline | null> {
  try {
    return api.getStreamerOnline(id);
  } catch (error) {
    if (maxRetry > 0) {
      return getStreamerOnline(id, maxRetry - 1);
    }
    throw error;
  }
}

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

  characters: {
    name: string;
    wikiLink: string;
    image: string | null;
  }[];
};

export async function getFiveCityStreamers(hostname: string) {
  const apiCharactersUrl = `http://${hostname}/api/v1/characters`;

  const [characters, _] = await Promise.all([
    fetch(apiCharactersUrl).then(
      (r) => r.json() as Promise<CharactersApiResponse>
    ),
    api.getStreamerByName("ewroon"), // first call to api will generate OAuth token
  ]);

  let twitchStreamers = characters
    .map((p) => p.socialLinks.twitch)
    .filter(notEmpty);
  twitchStreamers = twitchStreamers.filter(
    (c, i) => twitchStreamers.indexOf(c) === i
  );
  console.log(`${twitchStreamers.length} Streamerów`);

  const data = twitchStreamers.map((twitchUrl) => {
    return limit(async () => {
      const myCharList = characters.filter(
        (c) => c.socialLinks.twitch === twitchUrl
      );

      const channelName = twitchUrl.replace("https://www.twitch.tv/", "");
      const s = await getStreamerByName(channelName);
      //   const s = await api.getStreamerByName(channelName);
      let viewerCount = 0;
      let isLive = s?.is_live ?? false;
      if (isLive) {
        // const liveInfo = await api.getStreamerOnline(`${s?.id}`);
        const liveInfo = await getStreamerOnline(`${s?.id}`);

        if (liveInfo?.game_name === GTA) {
          // nie wszyscy mają odpowiednie tytuły

          // const titleWords = liveInfo.title.split(" ");
          // const whitelist = ["[5city]", "5city", "fivecity", "5miasto"]; // important set it lowercase!
          // for (let i = 0; i < titleWords.length; i++) {
          //   if (whitelist.includes(titleWords[i].toLowerCase())) {
          //     isFiveCity = true;
          //     break;
          //   }
          // }

          isLive = true;
          viewerCount = liveInfo?.viewer_count ?? 0;
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
  const sortedList = streamersList.sort((a, b) => {
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

  return sortedList;
}
