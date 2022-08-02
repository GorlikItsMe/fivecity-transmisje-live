import type { NextApiRequest, NextApiResponse } from "next";
import { CharacterData } from "../../../lib/getAllFiveCityCharacters";
import { getAllFiveCityCharactersAPI } from "../../api_with_cache_workaround/getAllFiveCityCharacters";
import Cors from "cors";
import { runMiddleware } from "../../../lib/runMiddleware";

const cors = Cors({
  methods: ["GET", "HEAD"],
});


export type Data = CharacterData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors);

  const data = await getAllFiveCityCharactersAPI(req.headers.host ?? "");
  res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
  res.status(200).json(data);
}
