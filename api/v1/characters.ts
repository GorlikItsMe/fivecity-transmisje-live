import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { readFileSync } from 'fs'
import Cors from "cors";
import { runMiddleware } from "../../lib/runMiddleware";
import { CharacterData } from "../../lib/getAllFiveCityCharacters";

const cors = Cors({
    methods: ["GET", "HEAD"],
});

export type Data = CharacterData[]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await runMiddleware(req, res, cors);

    const path = join(process.cwd(), 'data', 'characters.json')
    try {
        const content = readFileSync(path, { encoding: 'utf8', flag: 'r' })
        res.setHeader("Cache-Control", "s-maxage=86400"); // cache 1 day
        res.status(200).json(JSON.parse(content))
    } catch (error) {
        res.status(404).send('')
    }
}
