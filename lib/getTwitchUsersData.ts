import { Data as CharactersApiResponse } from "../pages/api/v1/characters";
import pLimit from "p-limit";
import { join } from "path";
import { readFileSync } from "fs";
import api from "./twitchApi";
import { notEmpty } from "./notEmpty";
import { createLogger } from "./logger";

const logger = createLogger("getTwitchUsersData");

export interface TwitchCachedUser {
  id: string;
  displayName: string;
  profilePictureUrl: string;
}
export async function getTwitchUsersData(concurency: number) {
  logger.info("Pobieram podstawowe informacje o streamerach");
  const limit = pLimit(concurency);
  const charactersJsonPath = join(process.cwd(), "data", "characters.json");
  const content = readFileSync(charactersJsonPath, { encoding: "utf8" });
  const data: CharactersApiResponse = JSON.parse(content);

  const twitchCachedUserData = data
    .map((c) => c.socialLinks.twitch)
    .filter(notEmpty)
    .map((twitchUrl) =>
      limit(async () => {
        const channelName = twitchUrl.replace("https://www.twitch.tv/", "");
        const user = await api.users.getUserByName(channelName).catch((err) => {
          return null;
        });
        if (user === null) {
          return null;
        }
        return {
          id: user.id,
          displayName: user.displayName,
          profilePictureUrl: user.profilePictureUrl,
        };
      })
    );
  const twitchUsersList = await Promise.all(twitchCachedUserData);
  const clearedTwitchUsersList = twitchUsersList.filter(notEmpty);
  logger.info(
    `Zapisano ${clearedTwitchUsersList.length} informacji o kontach twitch`
  );
  return clearedTwitchUsersList;
}
