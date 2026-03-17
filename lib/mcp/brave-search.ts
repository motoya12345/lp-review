export interface SearchResult {
  title:   string;
  url:     string;
  snippet: string;
}

export async function braveSearch(
  query: string,
  count: number = 5
): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      {
        headers: {
          "Accept":              "application/json",
          "X-Subscription-Token": apiKey,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.web?.results?.map((r: { title: string; url: string; description: string }) => ({
      title:   r.title,
      url:     r.url,
      snippet: r.description ?? "",
    })) ?? [];
  } catch {
    return [];
  }
}
