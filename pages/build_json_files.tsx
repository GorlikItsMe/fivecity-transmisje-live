import type { GetStaticProps } from "next";
import { join } from "path";
import fs from "fs";
import { getAllFiveCityCharacters } from "../lib/getAllFiveCityCharacters";
import { getTwitchUsersData } from "../lib/getTwitchUsersData";

export default function Page() {
  return <h1>404 Not Found</h1>;
}

export const getStaticProps: GetStaticProps = async () => {
  // create characters.json
  fs.writeFileSync(
    join(process.cwd(), "data", "characters.json"),
    JSON.stringify(await getAllFiveCityCharacters(10))
  );

  // create streamersById.json
  fs.writeFileSync(
    join(process.cwd(), "data", "twitchCachedUsersData.json"),
    JSON.stringify(await getTwitchUsersData(10))
  );

  return {
    props: {},
  };
};
