import type { NextApiRequest, NextApiResponse } from "next";
import {
  getFiveCityStreamers,
  StreamerData,
} from "../../../lib/getFiveCityStreamers";
import Cors from "cors";
import { runMiddleware } from "../../../lib/runMiddleware";

const cors = Cors({
  methods: ["GET", "HEAD"],
});


export type Data = StreamerData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors);

  const hostname = req.headers.host ?? "localhost";
  const data = await getFiveCityStreamers(hostname);

  res.setHeader("Cache-Control", "s-maxage=300"); // cache 5 minutes
  res.status(200).json(data);
}
