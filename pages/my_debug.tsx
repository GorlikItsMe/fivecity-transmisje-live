import type { GetStaticProps } from "next";
import { join } from "path";
import fs from "fs";
import {
  getAllFiveCityCharacters,
  getCharacterDetails,
} from "../lib/getAllFiveCityCharacters";
import { getTwitchUsersData } from "../lib/getTwitchUsersData";

export default function Page() {
  return <h1>404 Not Found</h1>;
}

export const getStaticProps: GetStaticProps = async () => {
  const x = await getCharacterDetails(
    "https://5city.fandom.com/pl/wiki/Bella_Lux"
  );
  console.log(x);
  return {
    props: {},
  };
};
