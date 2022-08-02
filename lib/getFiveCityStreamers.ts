import { Data as CharactersApiResponse } from "../pages/api/v1/characters";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import pLimit from "p-limit";

const clientId = process.env.TWITCH_API_CLIENT_ID ?? "";
const clientSecret = process.env.TWITCH_API_CLIENT_SECRET ?? "";

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const api = new ApiClient({ authProvider });

const limit = pLimit(900);
const GTA = "Grand Theft Auto V";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
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
  const start_dt = new Date().getTime();
  const apiCharactersUrl = `http://${hostname}/api/v1/characters`;

  const [characters, _] = await Promise.all([
    fetch(apiCharactersUrl).then(
      (r) => r.json() as Promise<CharactersApiResponse>
    ),
    () => {
      // first call to api will generate OAuth token
      api.users.getUserByName('ewroon');
    }
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
      const user = await api.users.getUserByName(channelName).catch((err) => { return null })
      if (user == null) {
        // cant fetch data about that streamer (maybe baned?)
        return {
          image: "",
          name: "",
          socialMedia: {
            twitch: null,
            twitter: null,
            instagram: null,
            youtube: null,
            facebook: null,
          },
          viewerCount: 0,
          isLive: false,
          characters: [],
        }
      }
      const stream = await user.getStream()

      let isLive = stream !== null;
      let viewerCount = stream?.viewers ?? 0;

      const isFiveCityLive = (function () {
        if (!isLive) { return false }
        if (stream?.gameName !== GTA) { return false }
        const sTitle = stream.title;

        // nie wszyscy mają odpowiednie tytuły no ale trudno nic z tym nie zrobimy
        const whitelist = ["[5city]", "5city", "fivecity", "5miasto"];
        const blacklist = ["77rp"];

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

        // Nie mogę być pewny czy to jest live z FiveCity czy z innego serwera GTA RP
        return false;
      })()


      let d: StreamerData;
      d = {
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
  const end_dt = new Date().getTime();
  console.log(`Wygenerowano w: ${end_dt - start_dt}ms -> ${(end_dt - start_dt) / 1000}sek -> AVG per Streamer ${(end_dt - start_dt) / streamersList.length}`);
  return sortedList;
}
