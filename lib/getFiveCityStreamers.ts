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

  const data = twitchStreamers.map((twitchUrl) => {
    return limit(async () => {
      const myCharList = characters.filter(
        (c) => c.socialLinks.twitch === twitchUrl
      );

      const channelName = twitchUrl.replace("https://www.twitch.tv/", "");
      const s = await getStreamerByName(channelName);
      //   const s = await api.getStreamerByName(channelName);
      let viewerCount = 0;
      if (s?.is_live ?? false) {
        // const liveInfo = await api.getStreamerOnline(`${s?.id}`);
        const liveInfo = await getStreamerOnline(`${s?.id}`);
        viewerCount = liveInfo?.viewer_count ?? 0;
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

  return await Promise.all(data);
}
