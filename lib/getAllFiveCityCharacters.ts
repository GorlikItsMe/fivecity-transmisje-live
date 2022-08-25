import { parse } from "node-html-parser";
import pLimit from "p-limit";

function caseInsensetiveSplit(str: string, separator: string) {
  // https://stackoverflow.com/questions/67227386/javascript-how-to-make-a-split-case-insensitive
  const regEscape = (v: string) =>
    v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  return str.split(new RegExp(regEscape(separator), "ig"));
}
function splitByCharacterList(separators: string[], str: string) {
  // https://erikmartinjordan.com/split-multiple-characters-javascript

  // Replacing the separators with a common separator
  // In this case, a sharp knife
  let replaced = separators.reduce((acc, separator) => {
    acc = acc.replaceAll(separator, "🔪");
    return acc;
  }, str);

  // Splitting the string by the sharp knife
  return replaced.split("🔪");
}

function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  maxRetry: number = 3
): Promise<Response> {
  return fetch(input, init).catch((error) => {
    if (maxRetry > 0) {
      console.log(`Retry ${input} (${maxRetry})`);
      return fetchWithRetry(input, init, maxRetry - 1);
    }
    throw error;
  });
}

function getImageUrlByNameFromFandom(filename: string): Promise<string> {
  const url = `https://5city.fandom.com/pl/wikia.php?controller=Lightbox&method=getMediaDetail&fileTitle=${encodeURIComponent(
    filename
  )}&format=json`;
  return fetchWithRetry(url)
    .then((r) => r.json())
    .then((r) => {
      if (r.rawImageUrl == undefined) {
        console.log(url);
      }
      return r.rawImageUrl ?? null;
    });
}

async function getCharacterDetails(url: string) {
  /*const editLink = `${url}?action=edit`;
  const r = await fetchWithRetry(editLink);
  if (r.status !== 200) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const root = parse(await r.text());
  const code = (root.querySelector("textarea")?.text ?? "")
    .replaceAll(" =", "=")
    .replaceAll("= ", "=");

  const name = (
    root
      .querySelector("#mw-returnto a")
      ?.text.replace("/Sezon 1", "")
      .replace("/ Sezon 2", "") ?? ""
  ).trim();
  */

  // NEW FANDOM API
  const pageName = url.replace("https://5city.fandom.com/pl/wiki/", "");
  const editLink = `https://5city.fandom.com/pl/api.php?action=visualeditor&format=json&paction=wikitext&page=${pageName}&uselang=pl&formatversion=2`;
  const r = await fetchWithRetry(editLink);
  if (r.status !== 200) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const jsonData = await r.json();
  const code: string = jsonData.visualeditor.content;

  const name = decodeURIComponent(
    pageName
      .replace("/Sezon_1", "")
      .replace("/_Sezon_2", "")
      .replace("/Sezon_2", "")
      .replaceAll("_", " ")
      .trim()
  );
  // console.log(name);

  const mainComponentName = (function () {
    if (code.includes("{{InfoboxPostać")) {
      return "InfoboxPostać";
    }
    if (code.includes("{{PostaćRP")) {
      return "PostaćRP";
    }
    return "";
  })();

  if (mainComponentName == "") {
    // incorrect data ex: https://5city.fandom.com/pl/wiki/Leo_Griffin?action=edit
    console.log(`Niepoprawna strona`, url);
    return {
      wikiLink: url,
      image: null,
      name: name,
      socialLinks: {
        twitch: null,
        twitter: null,
        instagram: null,
        youtube: null,
        facebook: null,
      },
    };
  }

  const image = (function () {
    const afterObraz =
      mainComponentName == "PostaćRP"
        ? code.split("PostaćRP")[1].split("obraz=")[1]
        : code.split("InfoboxPostać")[1].split("zdjecie=")[1];
    if (afterObraz == undefined) {
      return null;
    }

    const fileTag = splitByCharacterList(
      ["\n", "|", "}", "]"],
      afterObraz
    )[0].trim();
    let filename = fileTag
      .replaceAll("Plik:", "")
      .replaceAll("]", "")
      .replaceAll("[", "")
      .replaceAll("{", "")
      .replaceAll("}", "");
    if (filename == "") {
      return null;
    }

    if (filename.includes("<tabber>")) {
      // https://5city.fandom.com/pl/wiki/Dante_Capela
      const taberTag = afterObraz.split("<tabber>")[1].split("</tabber>")[0];
      filename = splitByCharacterList(
        ["\n", "|", "}", "]"],
        caseInsensetiveSplit(taberTag, "Plik:")[1]
      )[0]
        .split("|")[0]
        .trim();
      filename = filename
        .replaceAll("]", "")
        .replaceAll("[", "")
        .replaceAll("{", "")
        .replaceAll("}", "");
    }
    return filename;
  })();
  const imageUrl = image ? await getImageUrlByNameFromFandom(image) : null;

  function getSocialLink(socialName: string) {
    const a = code.split(mainComponentName)[1].split(`${socialName}=`)[1];
    if (a == undefined || a.startsWith("}}")) {
      return null;
    }
    const socialTag = splitByCharacterList(["\n", "|"], a)[0].trim();
    let socialLink = socialTag
      .replaceAll("]", "")
      .replaceAll("[", "")
      .split(" ")[0];

    // link normalizer
    if (socialLink.endsWith("/")) {
      socialLink = socialLink.slice(0, -1); // remove last /
    }
    socialLink = socialLink.replace("http://", "https://"); // force https
    socialLink = socialLink.split("?")[0]; // remove useless parametrs from link

    if (socialLink == "" || socialLink.startsWith("-")) {
      return null;
    }

    // fix links (all must look the same soo rest scripts can work)
    socialLink = socialLink.replace(
      "https://twitch.tv/",
      "https://www.twitch.tv/"
    );
    socialLink = socialLink.replace(
      "https://instagram.com/",
      "https://www.instagram.com/"
    );
    socialLink = socialLink.replace(
      "https://www.twitter.com/",
      "https://twitter.com/"
    );
    socialLink = socialLink.replace(
      "https://youtube.com/",
      "https://www.youtube.com/"
    );
    if (
      socialName == "twitch" &&
      !socialLink.startsWith("https://www.twitch.tv/")
    ) {
      return null; // incorrect link ex: https://5city.fandom.com/pl/wiki/Mac_Taylor
    }

    return socialLink.toLocaleLowerCase();
  }

  return {
    wikiLink: url,
    image: imageUrl,
    name: name,
    socialLinks: {
      twitch: getSocialLink("twitch"),
      twitter: getSocialLink("twitter"),
      instagram: getSocialLink("instagram"),
      youtube: getSocialLink("youtube"),
      facebook: getSocialLink("facebook"),
    },
  };
}

async function getAllCharacterLinks(url: string): Promise<string[]> {
  const root = parse(await fetchWithRetry(url).then((res) => res.text()));
  const nextPageUrl =
    root
      .querySelector(".category-page__pagination-next")
      ?.getAttribute("href") ?? null;

  let linkList = root
    .querySelectorAll(".category-page__member-link")
    .map((el) => `https://5city.fandom.com${el.getAttribute("href")}`);

  if (nextPageUrl) {
    const moreLinks = await getAllCharacterLinks(nextPageUrl);
    return linkList.concat(moreLinks);
  }

  return linkList;
}

export type CharacterData = {
  wikiLink: string;
  image: string | null;
  name: string;
  socialLinks: {
    twitch: string | null;
    twitter: string | null;
    youtube: string | null;
    instagram: string | null;
    facebook: string | null;
  };
};

export async function getAllFiveCityCharacters(
  concurency = 100
): Promise<CharacterData[]> {
  const limit = pLimit(concurency);

  const url_s2 = "https://5city.fandom.com/pl/wiki/Kategoria:Posta%C4%87";
  const url_s1 =
    "https://5city.fandom.com/pl/wiki/Kategoria:Posta%C4%87_(Sezon_1)";

  // wszystkie postaci
  console.log("Tworzę listę linków postaci");
  let [fandomLinkList, sezon1LinkList] = await Promise.all([
    getAllCharacterLinks(url_s2),
    getAllCharacterLinks(url_s1),
  ]);
  // console.log(fandomLinkList.length);
  // console.log(sezon1LinkList.length);
  fandomLinkList.push(...sezon1LinkList);

  // remove duplicates from fandomLinkList
  fandomLinkList = fandomLinkList.filter(
    (link, index) => fandomLinkList.indexOf(link) == index
  );

  console.log(`Pobieram informacje z ${fandomLinkList.length} stron`);
  const promiseList = fandomLinkList.map((url) =>
    limit(() => getCharacterDetails(url))
  );
  let characterDetailsList = await Promise.all(promiseList);

  // SYNCHRONOUS DEBUG CODE (for debuging purposes)
  // const characterDetailsList = [];
  // for (let i = 0; i < fandomLinkList.length; i++) {
  //   const url = fandomLinkList[i];
  //   characterDetailsList.push(await getCharacterDetails(url));
  // }

  console.log(`Wczytano ${characterDetailsList.length} postaci`);

  // usuń duplikaty postaci (są informacje o postaci z różnych sezonów, wyświetlaj zawsze najnowszy możliwy)
  characterDetailsList = characterDetailsList.filter((ch) => {
    // znajdz postaci z takim samym imieniem
    let dupList = characterDetailsList.filter(
      (ch2) => ch.name.toLocaleLowerCase() == ch2.name.toLocaleLowerCase()
    );

    // ułóż linki w kolejności
    // '' /Sezon_2 /_Sezon_2 /Sezon_1
    dupList.sort((a, b) => {
      function abc(url: string) {
        if (url.endsWith("/Sezon_2")) return 2;
        if (url.endsWith("/_Sezon_2")) return 3;
        if (url.endsWith("/Sezon_1")) return 4;
        return 1;
      }
      if (abc(a.wikiLink) < abc(b.wikiLink)) {
        return -1;
      } else if (abc(a.wikiLink) > abc(b.wikiLink)) {
        return 1;
      } else {
        return 0;
      }
    });

    // jeżeli ten link jest pierwszym linkiem z listy -> true
    // else false
    if (dupList[0].wikiLink == ch.wikiLink) {
      return true;
    }
    return false;
  });

  console.log(`Po usunięciu duplikatów ${characterDetailsList.length} postaci`);
  return characterDetailsList;
}
