import * as cheerio from "cheerio";

export interface FetchedLP {
  url:       string;
  title:     string;
  headings:  string[];
  ctaTexts:  string[];
  bodyText:  string;
  metaDesc?: string;
}

export async function fetchLP(url: string): Promise<FetchedLP> {
  const res  = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LPReviewBot/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();
  const $    = cheerio.load(html);

  return {
    url,
    title:    $("title").text().trim(),
    headings: $("h1, h2").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    ctaTexts: $("button, a").map((_, el) => $(el).text().trim()).get()
              .filter((t) => t.length > 0 && t.length < 30),
    bodyText: $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000),
    metaDesc: $('meta[name="description"]').attr("content"),
  };
}
