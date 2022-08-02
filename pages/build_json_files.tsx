import type { GetStaticProps } from "next";
import { join } from "path";
import fs from 'fs'

export default function Page() {
  return <h1>404 Not Found</h1>;
}

export const getStaticProps: GetStaticProps = async () => {
  // tutaj coś się robi
  console.log("TEST create json file during build, and access it from API");
  const path = join(process.cwd(), 'data', 'characters.json')
  console.log(path)
  fs.writeFileSync(path, '{ "foo": "bar" }')

  return {
    props: {},
  };
};
