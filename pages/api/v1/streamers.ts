import type { NextApiRequest, NextApiResponse } from "next";
import {
  getFiveCityStreamers,
  StreamerData,
} from "../../../lib/getFiveCityStreamers";

export type Data = StreamerData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const hostname = req.headers.host ?? "localhost";
  const data = await getFiveCityStreamers(hostname);

  res.setHeader("Cache-Control", "s-maxage=300"); // cache 5 minutes
  res.status(200).json(data);
}
