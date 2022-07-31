import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";
import pLimit from "p-limit";

const limit = pLimit(5);

async function getCharacterDetails(url: string) {
  const r = await fetch(url);
  if (r.status !== 200) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const root = parse(await r.text());

  const name = root.querySelector(".pi-item.pi-title")?.textContent ?? "";
  const image = root
    .querySelector(".pi-item.pi-image .image.image-thumbnail")
    ?.getAttribute("href");

  const linkList = root
    .querySelectorAll(".pi-item.pi-group a")
    .map((a) => a.getAttribute("href") ?? "")
    .filter((href) => href?.includes("http"))
    .filter((a) => a !== "");

  const whitelist = ["twitch", "twitter", "youtube", "instagram"];
  const socialLinks = linkList.filter((href) => {
    return whitelist.some((element) => href?.includes(element));
  });

  return {
    wikiLink: url,
    image: image,
    name: name,
    socialLinks: {
      twitch: socialLinks.find((href) => href?.includes("twitch")) ?? null,
      twitter: socialLinks.find((href) => href?.includes("twitter")) ?? null,
      youtube: socialLinks.find((href) => href?.includes("youtube")) ?? null,
      instagram:
        socialLinks.find((href) => href?.includes("instagram")) ?? null,
    },
  };
}

export type Data = {
  wikiLink: string;
  image: string | undefined;
  name: string;
  socialLinks: {
    twitch: string | null;
    twitter: string | null;
    youtube: string | null;
    instagram: string | null;
  };
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const url = "https://5city.fandom.com/pl/wiki/Kategoria:Posta%C4%87";
  const htmlContent = await fetch(url).then((res) => res.text());
  const root = parse(htmlContent);
  const fiveCityCharactersLinks = root
    .querySelectorAll(".category-page__member-link")
    .map((el) => `https://5city.fandom.com${el.getAttribute("href")}`);

  const promiseList = fiveCityCharactersLinks.map((url) => {
    return limit(() => getCharacterDetails(url));
  });
  const characterDetailsList = await Promise.all(promiseList);

  res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
  res.status(200).json(characterDetailsList);
}
