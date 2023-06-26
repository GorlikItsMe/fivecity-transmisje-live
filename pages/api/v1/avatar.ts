import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { readFileSync } from "fs";
import Cors from "cors";
import { runMiddleware } from "../../../lib/runMiddleware";
import twitchApi from "../../../lib/twitchApi";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

async function getIconByUrl(req: NextApiRequest, twitchImageUrl: string) {
  const url = new URL(`http://localhost:3000/_next/image?url=&w=64&q=75`);
  url.searchParams.set("url", twitchImageUrl);
  url.protocol = req.headers["x-forwarded-proto"]
    ? `${req.headers["x-forwarded-proto"]}:`
    : "http:";
  url.host = (req.headers["x-forwarded-host"] as string) ?? "localhost:3000";

  const r = await fetch(url.href);
  const buf = await r.arrayBuffer();
  return buf;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  if ("displayName" in req.query === false) {
    res.status(400).send("");
    return;
  }
  const displayName = `${req.query["displayName"]}`;

  const path = join(process.cwd(), "data", "twitchCachedUsersData.json");
  try {
    const content = readFileSync(path, { encoding: "utf8", flag: "r" });
    const data = JSON.parse(content) as {
      id: string;
      displayName: string;
      profilePictureUrl: string;
    }[];

    const cachedData = data.find(
      (v) => v.displayName.toLowerCase() == displayName.toLowerCase()
    );

    if (cachedData) {
      const buf = await getIconByUrl(req, cachedData.profilePictureUrl);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
      res.status(200).send(Buffer.from(buf));
      return;
    }

    const profilePictureUrl = (await twitchApi.users.getUserByName(displayName))
      ?.profilePictureUrl;

    if (profilePictureUrl) {
      const buf = await getIconByUrl(req, profilePictureUrl);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
      res.status(200).send(Buffer.from(buf));
      return;
    }

    res.status(404).send("Not found");
    return;
  } catch (error) {
    res.status(404).send("");
  }
}
