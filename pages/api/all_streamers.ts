import type { NextApiRequest, NextApiResponse } from "next";
import TwitchEasy from "twitch-easy";
import { Data as ApiPostaciData } from "./postaci";
import pLimit from "p-limit";

const clientId = process.env.TWITCH_API_CLIENT_ID ?? "";
const clientSecret = process.env.TWITCH_API_CLIENT_SECRET ?? "";

const GTA = "Grand Theft Auto V";

const api = new TwitchEasy(clientId, clientSecret);
const limit = pLimit(200);

export type StreamerData = {
  wikiLink: string;
  image: string | undefined;
  name: string;
  socialLinks: {
    twitch: string | null;
    twitter: string | null;
    youtube: string | null;
    instagram: string | null;
  };
  isLive: boolean;
  isFiveCity: boolean;
  viewerCount: number;
  twitchTvName: string | null;
};

export type Data = StreamerData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const start = new Date().getTime();

  // Get cached list of characters
  const r = await fetch(
    `http://${req.headers.host ?? "localhost"}/api/postaci`
  );
  const postaci: ApiPostaciData = await r.json();

  const mystart = new Date().getTime();

  // Get twitch.tv streamers
  const twitchStreamers = postaci.filter((p) => {
    return p.socialLinks.twitch != null;
  });

  // try use api (first call to api will authenticate you, get oauth token etc)
  await api.getStreamerByName("ewroon");

  const isLivePromiseList = twitchStreamers.map((p) => {
    return limit(async () => {
      let isLive = false;
      let viewerCount = 0;
      let isFiveCity = false;
      let twitchTvName = null;

      if (p.socialLinks.twitch != null) {
        const c = p.socialLinks.twitch.split("/") ?? [];
        twitchTvName = c[c.length - 1];

        const s = await api.getStreamerByName(twitchTvName);
        isLive = s?.is_live ?? false;

        if (isLive) {
          const liveInfo = await api.getStreamerOnline(`${s?.id}`);
          // Here check who is streaming FiveCity
          if (liveInfo?.game_name === GTA) {
            const titleWords = liveInfo.title.split(" ");
            const whitelist = ["[5city]", "5city", "fivecity", "5miasto"]; // important set it lowercase!
            for (let i = 0; i < titleWords.length; i++) {
              if (whitelist.includes(titleWords[i].toLowerCase())) {
                isFiveCity = true;
                break;
              }
            }
          }

          viewerCount = liveInfo?.viewer_count ?? 0;
        }
      }
      return {
        wikiLink: p.wikiLink,
        image: p.image,
        name: p.name,
        socialLinks: p.socialLinks,
        isLive: isLive,
        isFiveCity: isFiveCity,
        viewerCount: viewerCount,
        twitchTvName: twitchTvName,
      };
    });
  });

  const isLiveList = await Promise.all(isLivePromiseList);

  // sort isLiveList, where isLive is true first and viewerCount is highest first
  const sortedIsLiveList2 = isLiveList.sort((a, b) => {
    if (a.isFiveCity && !b.isFiveCity) {
      return -1;
    }
    if (!a.isFiveCity && b.isFiveCity) {
      return 1;
    }
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
    return 0;
  });

  res.setHeader("Cache-Control", "s-maxage=60"); // cache 1 minute
  res.status(200).json(sortedIsLiveList2);

  const end = new Date().getTime();
  console.log(`/api/all_streamers/ Time: ${end - start} (${end - mystart})`);
}
