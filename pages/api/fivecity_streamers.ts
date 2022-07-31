// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Data as ApiAllStreamersData } from "./all_streamers";
import Cors from "cors";
import { runMiddleware } from "../../lib/runMiddleware";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

export type Data = ApiAllStreamersData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors);

  const start = new Date().getTime();

  // Get cached list of all streamers
  const r = await fetch(
    `http://${req.headers.host ?? "localhost"}/api/all_streamers`
  );
  const streamersNow: ApiAllStreamersData = await r.json();

  const mystart = new Date().getTime();

  const fivecityStreamers = streamersNow.filter(
    (p) => p.isLive && p.isFiveCity
  );

  res.setHeader("Cache-Control", "s-maxage=60"); // cache 1 minute
  res.status(200).json(fivecityStreamers);

  const end = new Date().getTime();
  console.log(`/api/fivecity_streamers/ Time: ${end - start} ${end - mystart}`);
}
