const tagRegex = /{(.+?)}/g;

function hasTags(text: string) {
  return !!text.match(tagRegex);
}

interface Tags {
  [tagname: string]: string; 
}

const cache: Tags = {};

/**
 * Returns the resolved value of a template tag.
 * 
 * @param tagname The name of the template tag.
 */
async function resolveTagname(tagname: string) {
  if (cache[tagname]) {
    return cache[tagname];
  }

  const translatedTag = await translateTag(tagname);
  let resolvedTag: string;

  if (hasTags(translatedTag)) {
    const tags = await getTags(translatedTag);

    resolvedTag = translatedTag.replace(tagRegex, (tag: string, tagname: string) => tags[tagname]);
  } else {
    resolvedTag = translatedTag;
  }
  cache[tagname] = resolvedTag;
  return resolvedTag;
}

/**
 * Returns the template tags of a string.
 */
async function getTags(text: string) {
  const matches = [...text.matchAll(tagRegex)];
  const tagnames: Array<string> = [...new Set(matches.map(match => match[1]))];
  const resolvedTagnames: Array<string> = await Promise.all(tagnames.map(resolveTagname));
  const tags: Tags = {};

  for (let i = 0; i < tagnames.length; i += 1) {
    tags[tagnames[i]] = resolvedTagnames[i];
  }

  return tags;
}

/**
 * Processes a string with template tags
 * and returns a new string with the resolved tags.
 */
async function processInput(text: string) {
  const tags = await getTags(text);
  return text.replace(tagRegex, (tag: string, tagname: string) => tags[tagname]);
}

// DON'T CHANGE ANYTHING BELOW THIS LINE
const EXPECTED_RESULT =
    "The movie The Matrix is starring Keanu Reeves who is also in Speed and John Wick which have the average rating of 4.3 stars.";

async function translateTag(tag: string): Promise<string> {
    switch (tag) {
        case "movie":
            return "The Matrix";
        case "actor":
            return "Keanu Reeves";
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    switch (tag) {
        case "other-movies":
            return "{popular-movie-1} and {popular-movie-2}";
        case "avg-rating":
            return "4.3";
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    switch (tag) {
        case "popular-movie-1":
            return "Speed";
        case "popular-movie-2":
            return "John Wick";
    }
    return tag;
}

function readInput(): string {
    return "The movie {movie} is starring {actor} who is also in {other-movies} which have the average rating of {avg-rating} stars.";
}

async function run() {
    const startTime = Date.now();
    let result = "";
    try {
        result = await processInput(readInput());
    } catch (e) {
        console.log("Error thrown", e);
    }
    const duration = Date.now() - startTime;
    const status: string = result === EXPECTED_RESULT ? "SUCCESS" : "FAIL";
    console.log({ duration, result, status });
}
run();
