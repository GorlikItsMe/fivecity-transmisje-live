import type { NextApiRequest, NextApiResponse } from "next";
import {
  getFiveCityStreamers,
  StreamerData,
} from "../../../lib/getFiveCityStreamers";
import Cors from "cors";
import { runMiddleware } from "../../../lib/runMiddleware";
import { Mutex } from 'async-mutex';
import cache from 'memory-cache'

const cors = Cors({
  methods: ["GET", "HEAD"],
});

const mutex = new Mutex();

export type Data = StreamerData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors);

  await mutex.runExclusive(async () => {
    let data: StreamerData[] | null = cache.get('streamers_live');

    if (data == null) {
      data = await (await getFiveCityStreamers()).filter((p) => p.isLive);
      cache.put('streamers_live', data, 1 * 60 * 1000); // time in ms
    }
    res.setHeader("Cache-Control", "s-maxage=60"); // cache 1 minute
    res.status(200).json(data);

  });
}
