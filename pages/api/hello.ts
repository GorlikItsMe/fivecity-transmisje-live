// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const a = [
    "https://www.twitch.tv/mradamsky/",
    "https://www.twitch.tv/misiu987",
  ];

  const b = a.map((url) => {
    const c = url.split("/");
    const name1 = c[c.length - 1];
    const name2 = c[c.length - 2];
    const name = name1 != '' ? name1 : name2;
    return name;
  })
  console.log(b)

  res.status(200).json({ name: "John Doe" });
}
