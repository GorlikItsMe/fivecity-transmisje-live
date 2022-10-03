import { Data as CharactersApiResponse } from "../pages/api/v1/characters";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import pLimit from "p-limit";
import { join } from "path";
import { readFileSync } from "fs";
import { notEmpty } from "./notEmpty";

const clientId = process.env.TWITCH_API_CLIENT_ID ?? "";
const clientSecret = process.env.TWITCH_API_CLIENT_SECRET ?? "";

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const api = new ApiClient({ authProvider });


export interface TwitchCachedUser {
    id: string;
    displayName: string;
    profilePictureUrl: string;
}
export async function getTwitchUsersData(concurency: number) {
    const limit = pLimit(concurency);
    const charactersJsonPath = join(process.cwd(), "data", "characters.json")
    const content = readFileSync(charactersJsonPath, { encoding: 'utf8' })
    const data: CharactersApiResponse = JSON.parse(content)

    const twitchCachedUserData = data.map((c) => c.socialLinks.twitch)
        .filter(notEmpty)
        .map((twitchUrl) =>
            limit(async () => {
                const channelName = twitchUrl.replace("https://www.twitch.tv/", "");
                const user = await api.users.getUserByName(channelName).catch((err) => { return null })
                if (user === null) { return null }
                return {
                    id: user.id,
                    displayName: user.displayName,
                    profilePictureUrl: user.profilePictureUrl,
                }
            })
        )
    const twitchUsersList = await Promise.all(twitchCachedUserData);
    const clearedTwitchUsersList = twitchUsersList.filter(notEmpty)
    console.log(`Zapisano ${clearedTwitchUsersList.length} informacji o kontach twitch`)
    return clearedTwitchUsersList
}
