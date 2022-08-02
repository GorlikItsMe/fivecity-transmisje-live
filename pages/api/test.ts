import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import fs from 'fs'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const path = join(process.cwd(), 'data', 'characters.json')

    let content = null
    let isError = false;
    try {
        content = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
    } catch (error) {
        isError = true;
    }

    res.status(200).json({
        cwd: process.cwd(),
        path: path,
        content: content,
        isError: isError,
    });
}
