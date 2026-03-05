import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const SHARE_URL_REGEX = /https?:\/\/[\w.-]+(?:\/[^\s]*)?/gi;
const DOUYIN_SHORT_REGEX = /(v\.douyin\.com\/[\w-]+\/?)/i;
const TIKTOK_SHORT_REGEX = /((?:vm|vt)\.tiktok\.com\/[\w-]+\/?)/i;

const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  accept: "text/html,application/json;q=0.9,*/*;q=0.8",
};

const MOBILE_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "accept-language": "en-US,en;q=0.9",
  accept: "text/html,application/json;q=0.9,*/*;q=0.8",
};

const sanitizeUrl = (url) => {
  return url
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/[),.!?，。？！】》>]+$/g, "");
};

const getHeadersForHost = (hostname) => {
  const host = hostname.toLowerCase();
  if (host.includes("iesdouyin.com")) {
    return {
      ...DEFAULT_HEADERS,
      referer: "https://www.iesdouyin.com/",
      origin: "https://www.iesdouyin.com",
    };
  }
  if (host.includes("douyin.com")) {
    return {
      ...MOBILE_HEADERS,
      referer: "https://www.douyin.com/",
      origin: "https://www.douyin.com",
    };
  }
  if (host.includes("tiktok.com")) {
    return {
      ...DEFAULT_HEADERS,
      referer: "https://www.tiktok.com/",
      origin: "https://www.tiktok.com",
    };
  }
  return { ...DEFAULT_HEADERS };
};

const getHeadersForUrl = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return getHeadersForHost(hostname);
  } catch (error) {
    return { ...DEFAULT_HEADERS };
  }
};

const extractFirstUrl = (inputValue) => {
  const matches = inputValue.match(SHARE_URL_REGEX);
  if (matches && matches.length > 0) {
    return sanitizeUrl(matches[0]);
  }

  const douyinMatch = inputValue.match(DOUYIN_SHORT_REGEX);
  if (douyinMatch) {
    return `https://${sanitizeUrl(douyinMatch[1])}`;
  }

  const tiktokMatch = inputValue.match(TIKTOK_SHORT_REGEX);
  if (tiktokMatch) {
    return `https://${sanitizeUrl(tiktokMatch[1])}`;
  }

  return "";
};

const extractVideoIdFromUrl = (url) => {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : "";
};

const parseVideoIdFromPath = (inputUrl) => {
  if (!inputUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(inputUrl);
    const modalId = parsedUrl.searchParams.get("modal_id");
    if (modalId) {
      return modalId;
    }

    const path = parsedUrl.pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  } catch (error) {
    return "";
  }
};

const resolveRedirectUrl = async (url) => {
  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    const response = await fetch(normalizedUrl, {
      redirect: "follow",
      headers: getHeadersForUrl(normalizedUrl),
    });
    return response.url || normalizedUrl;
  } catch (error) {
    try {
      const response = await fetch(normalizedUrl, {
        redirect: "manual",
        headers: getHeadersForUrl(normalizedUrl),
      });
      return response.headers.get("location") || normalizedUrl;
    } catch (fallbackError) {
      return normalizedUrl;
    }
  }
};

const extractDouyinIdFromHtml = (html) => {
  const idMatch = html.match(/"itemId"\s*:\s*"(\d+)"/);
  if (idMatch) {
    return idMatch[1];
  }

  const detailMatch = html.match(/aweme_id=(\d+)/);
  if (detailMatch) {
    return detailMatch[1];
  }

  const fallbackMatch = html.match(/video\/(\d+)/);
  return fallbackMatch ? fallbackMatch[1] : "";
};

const extractTikTokVideoFromHtml = (html) => {
  const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>(.*?)<\/script>/);
  if (!sigiMatch) {
    return { id: "", url: "" };
  }

  const data = JSON.parse(sigiMatch[1]);
  const itemModule = data.ItemModule || {};
  const firstItem = Object.values(itemModule)[0];
  if (!firstItem || !firstItem.video) {
    return { id: "", url: "" };
  }

  const rawUrl = firstItem.video.playAddr || firstItem.video.downloadAddr;
  return {
    id: firstItem.id || "",
    url: rawUrl ? decodeURIComponent(rawUrl) : "",
  };
};

const extractDouyinJsonFromHtml = (html) => {
  const routerMatch = html.match(/window\._ROUTER_DATA\s*=\s*({[\s\S]*?})\s*<\/script>/);
  if (routerMatch?.[1]) {
    return routerMatch[1].trim();
  }

  const encodedMatch = html.match(/window\._ROUTER_DATA\s*=\s*JSON\.parse\("(.*?)"\)/);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1]);
  }

  const renderMatch = html.match(/window\.__INIT_PROPS__\s*=\s*({[\s\S]*?})\s*<\/script>/);
  if (renderMatch?.[1]) {
    return renderMatch[1].trim();
  }

  const renderDataMatch = html.match(/id="RENDER_DATA"[^>]*>([^<]+)</);
  if (renderDataMatch?.[1]) {
    return decodeURIComponent(renderDataMatch[1]);
  }

  return "";
};

const extractDouyinVideoFromRouterData = (data) => {
  const loaderData = data?.loaderData || {};
  const candidateKeys = Object.keys(loaderData).filter((key) =>
    key.includes("/page")
  );

  for (const key of candidateKeys) {
    const videoInfo = loaderData[key]?.videoInfoRes;
    const item = videoInfo?.item_list?.[0];
    const playUrl = item?.video?.play_addr?.url_list?.[0];
    if (playUrl) {
      return playUrl.replace("playwm", "play");
    }
  }

  return "";
};

const resolveDouyinRawUrl = async (shareUrl, trace) => {
  const directId = extractVideoIdFromUrl(shareUrl) || parseVideoIdFromPath(shareUrl);
  const resolvedUrl = directId ? shareUrl : await resolveRedirectUrl(shareUrl);
  let finalId =
    directId || extractVideoIdFromUrl(resolvedUrl) || parseVideoIdFromPath(resolvedUrl);
  let html = "";

  if (!finalId) {
    html = await fetchTextWithTrace(resolvedUrl, trace, "douyin-share-html");
    finalId = extractDouyinIdFromHtml(html) || parseVideoIdFromPath(resolvedUrl);
  }

  if (!finalId) {
    throw new Error("Unable to find Douyin video id from the shared link.");
  }

  const apiUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${finalId}`;
  let data;

  try {
    data = await fetchJsonWithTrace(apiUrl, trace, "douyin-iteminfo");
  } catch (error) {
    data = undefined;
  }

  if (data && data.item_list && data.item_list.length) {
    const playUrl = data.item_list[0]?.video?.play_addr?.url_list?.[0];
    if (playUrl) {
      return playUrl.replace("playwm", "play");
    }
  }

  if (!html) {
    html = await fetchTextWithTrace(resolvedUrl, trace, "douyin-share-html");
  }

  if (html) {
    const jsonText = extractDouyinJsonFromHtml(html);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const playUrl = extractDouyinVideoFromRouterData(parsed);
        if (playUrl) {
          return playUrl;
        }
      } catch (error) {
        // Fall through to error.
      }
    }
  }

  throw new Error("Unable to resolve Douyin raw video URL.");
};

const resolveDouyinRawUrlWithFallback = async (shareUrl, trace) => {
  try {
    return await resolveDouyinRawUrl(shareUrl, trace);
  } catch (error) {
    const resolvedUrl = await resolveRedirectUrl(shareUrl);
    const fallbackId = parseVideoIdFromPath(resolvedUrl);
    const fallbackUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${fallbackId}`;

    try {
      const data = await fetchJsonWithTrace(fallbackUrl, trace, "douyin-fallback");
      const playUrl = data?.aweme_detail?.video?.play_addr?.url_list?.[0];
      if (playUrl) {
        return playUrl.replace("playwm", "play");
      }
    } catch (fallbackError) {
      // Ignore fallback errors.
    }

    throw error;
  }
};

const resolveTikTokRawUrl = async (shareUrl) => {
  const directId = extractVideoIdFromUrl(shareUrl);
  const resolvedUrl = directId ? shareUrl : await resolveRedirectUrl(shareUrl);
  const html = await fetchText(resolvedUrl);
  const sigi = extractTikTokVideoFromHtml(html);
  const fallbackId = directId || sigi.id || extractVideoIdFromUrl(resolvedUrl);

  if (sigi.url) {
    return sigi.url.replace("playwm", "play");
  }

  if (!fallbackId) {
    throw new Error("Unable to find TikTok video id from the shared link.");
  }

  const apiUrl = `https://www.tiktok.com/api/item/detail/?itemId=${fallbackId}`;
  const data = await fetchJson(apiUrl);
  const item = data?.itemInfo?.itemStruct;
  const playUrl = item?.video?.playAddr || item?.video?.downloadAddr;

  if (!playUrl) {
    throw new Error("Unable to resolve TikTok raw video URL.");
  }

  return playUrl.replace("playwm", "play");
};

const createTrace = (enabled) => ({ enabled, entries: [] });

const pushTrace = (trace, entry) => {
  if (!trace?.enabled) {
    return;
  }
  trace.entries.push(entry);
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: getHeadersForUrl(url),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.text();
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: getHeadersForUrl(url),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error("Empty JSON response");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON response");
  }
};

const fetchTextWithTrace = async (url, trace, label) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: getHeadersForUrl(url),
  });
  const text = await response.text();

  pushTrace(trace, {
    label,
    url,
    status: response.status,
    ok: response.ok,
    sample: text.slice(0, 300),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return text;
};

const fetchJsonWithTrace = async (url, trace, label) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: getHeadersForUrl(url),
  });
  const text = await response.text();

  pushTrace(trace, {
    label,
    url,
    status: response.status,
    ok: response.ok,
    sample: text.slice(0, 300),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (!text) {
    throw new Error("Empty JSON response");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON response");
  }
};

app.post("/api/resolve", async (req, res) => {
  const trace = createTrace(Boolean(req.query.debug));

  try {
    const rawInput = typeof req.body?.url === "string" ? req.body.url : "";
    const sharedUrl = extractFirstUrl(rawInput) || rawInput;

    if (!sharedUrl) {
      return res.status(400).json({ error: "Paste a TikTok or Douyin share link." });
    }

    const normalizedUrl = /^https?:\/\//i.test(sharedUrl)
      ? sharedUrl
      : `https://${sharedUrl}`;

    const hostname = new URL(normalizedUrl).hostname.replace(/^www\./, "").toLowerCase();

    if (hostname.includes("douyin.com")) {
      const url = await resolveDouyinRawUrlWithFallback(normalizedUrl, trace);
      return res.json({ url, trace: trace.entries });
    }

    if (hostname.includes("tiktok.com")) {
      const url = await resolveTikTokRawUrl(normalizedUrl);
      return res.json({ url, trace: trace.entries });
    }

    return res.status(400).json({ error: "Only TikTok and Douyin links are supported." });
  } catch (error) {
    const message = error?.message || "Unable to resolve raw video URL.";
    return res.status(500).json({ error: message, trace: trace.entries });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Downloader API listening on http://localhost:${port}`);
});
