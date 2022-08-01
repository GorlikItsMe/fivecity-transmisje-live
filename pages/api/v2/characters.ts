import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAllFiveCityCharacters,
  CharacterData,
} from "../../../lib/getAllFiveCityCharacters";

type Data = CharacterData[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const start = new Date().getTime();

  const data = await getAllFiveCityCharacters();

  res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
  res.status(200).json(data);

  const end = new Date().getTime();
  console.log(
    `Pobrano informacje o ${data.length} postaciach z fivecity wiki w ${
      end - start
    }ms`
  );
}
