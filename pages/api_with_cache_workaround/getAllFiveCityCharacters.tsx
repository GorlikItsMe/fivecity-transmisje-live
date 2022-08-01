import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { parse } from "node-html-parser";
import {
  CharacterData,
  getAllFiveCityCharacters,
} from "../../lib/getAllFiveCityCharacters";

export default function Page({
  characters,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <h1>404 Not Found</h1>;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      characters: await getAllFiveCityCharacters(),
    },
  };
};

export async function getAllFiveCityCharactersAPI(
  hostname: string
): Promise<CharacterData[]> {
  const root = parse(
    await fetch(
      `http://${hostname}/api_with_cache_workaround/getAllFiveCityCharacters`
    ).then((r) => r.text())
  );
  const data = root.querySelector("#__NEXT_DATA__")?.innerText ?? "{}";
  const c = JSON.parse(data).props.pageProps.characters;
  return c;
}
