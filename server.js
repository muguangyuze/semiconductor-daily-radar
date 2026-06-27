const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, "public", "index.html"))
  ? path.join(__dirname, "public")
  : __dirname;

const STOCKS = [
  { symbol: "NVDA", name: "NVIDIA", region: "美国", sector: "AI 加速器" },
  { symbol: "AMD", name: "AMD", region: "美国", sector: "AI 加速器" },
  { symbol: "AVGO", name: "Broadcom", region: "美国", sector: "AI 网络/ASIC" },
  { symbol: "MU", name: "Micron", region: "美国", sector: "存储/HBM" },
  { symbol: "AMAT", name: "Applied Materials", region: "美国", sector: "半导体设备" },
  { symbol: "LRCX", name: "Lam Research", region: "美国", sector: "半导体设备" },
  { symbol: "INTC", name: "Intel", region: "美国", sector: "晶圆制造/CPU" },
  { symbol: "8035.T", name: "Tokyo Electron", region: "日本", sector: "半导体设备" },
  { symbol: "6857.T", name: "Advantest", region: "日本", sector: "测试设备" },
  { symbol: "6723.T", name: "Renesas", region: "日本", sector: "车用/MCU" },
  { symbol: "4063.T", name: "Shin-Etsu", region: "日本", sector: "硅片/材料" },
  { symbol: "005930.KS", name: "Samsung Electronics", region: "韩国", sector: "存储/HBM" },
  { symbol: "000660.KS", name: "SK Hynix", region: "韩国", sector: "存储/HBM" },
  {
    symbol: "688981.SS",
    name: "中芯国际",
    region: "A股",
    sector: "晶圆制造/CPU",
    thesis: "国产先进制程与成熟制程扩产核心载体",
    hardTags: ["国产替代", "制造平台", "高资本开支"],
    quality: 7
  },
  {
    symbol: "002371.SZ",
    name: "北方华创",
    region: "A股",
    sector: "半导体设备",
    thesis: "刻蚀、薄膜、清洗等设备平台化能力较强",
    hardTags: ["国产替代", "设备平台", "订单能见度"],
    quality: 9
  },
  {
    symbol: "688012.SS",
    name: "中微公司",
    region: "A股",
    sector: "半导体设备",
    thesis: "刻蚀设备和 MOCVD 具备高壁垒工艺属性",
    hardTags: ["工艺壁垒", "设备国产化", "先进制程"],
    quality: 9
  },
  {
    symbol: "688120.SS",
    name: "华海清科",
    region: "A股",
    sector: "半导体设备",
    thesis: "CMP 设备处于晶圆制造关键环节",
    hardTags: ["关键设备", "国产替代", "制程升级"],
    quality: 8
  },
  {
    symbol: "603501.SS",
    name: "韦尔股份",
    region: "A股",
    sector: "车用/MCU",
    thesis: "图像传感器周期复苏叠加汽车与高端影像升级",
    hardTags: ["CIS", "汽车电子", "周期复苏"],
    quality: 7
  },
  {
    symbol: "603986.SS",
    name: "兆易创新",
    region: "A股",
    sector: "存储/HBM",
    thesis: "利基存储与 MCU 受益于存储周期与国产供应链",
    hardTags: ["存储周期", "MCU", "国产替代"],
    quality: 7
  },
  {
    symbol: "600584.SS",
    name: "长电科技",
    region: "A股",
    sector: "先进封装",
    thesis: "封测龙头，受益先进封装和高性能计算封装需求",
    hardTags: ["封测龙头", "先进封装", "AI 算力"],
    quality: 8
  },
  {
    symbol: "002156.SZ",
    name: "通富微电",
    region: "A股",
    sector: "先进封装",
    thesis: "与高性能计算客户绑定较深，弹性来自先进封装放量",
    hardTags: ["高性能计算", "先进封装", "客户绑定"],
    quality: 7
  },
  {
    symbol: "002409.SZ",
    name: "雅克科技",
    region: "A股",
    sector: "硅片/材料",
    thesis: "电子材料、前驱体和特气环节具备国产替代逻辑",
    hardTags: ["电子材料", "前驱体", "国产替代"],
    quality: 7
  },
  {
    symbol: "688126.SS",
    name: "沪硅产业",
    region: "A股",
    sector: "硅片/材料",
    thesis: "半导体硅片国产化方向，和晶圆厂扩产相关度高",
    hardTags: ["硅片", "材料国产化", "晶圆扩产"],
    quality: 6
  },
  {
    symbol: "688256.SS",
    name: "寒武纪",
    region: "A股",
    sector: "AI 加速器",
    thesis: "国产 AI 芯片代表，受益算力国产化和智能计算中心需求",
    hardTags: ["AI芯片", "算力国产化", "训练推理"],
    quality: 8
  },
  {
    symbol: "688041.SS",
    name: "海光信息",
    region: "A股",
    sector: "AI 加速器",
    thesis: "国产高端处理器与加速器平台，服务器和信创算力具备持续跟踪价值",
    hardTags: ["国产CPU", "AI算力", "信创"],
    quality: 8
  },
  {
    symbol: "688008.SS",
    name: "澜起科技",
    region: "A股",
    sector: "AI 网络/ASIC",
    thesis: "内存接口芯片和服务器平台芯片受益于 AI 服务器与高带宽内存链条",
    hardTags: ["内存接口", "AI服务器", "高带宽内存"],
    quality: 8
  },
  {
    symbol: "688525.SS",
    name: "佰维存储",
    region: "A股",
    sector: "存储/HBM",
    thesis: "存储模组和企业级存储受益于存储周期复苏与国产替代",
    hardTags: ["存储周期", "企业级存储", "国产替代"],
    quality: 6
  },
  {
    symbol: "688072.SS",
    name: "拓荆科技",
    region: "A股",
    sector: "半导体设备",
    thesis: "薄膜沉积设备处于晶圆制造关键工艺环节，国产替代空间明确",
    hardTags: ["薄膜沉积", "关键设备", "国产替代"],
    quality: 8
  },
  {
    symbol: "688082.SS",
    name: "盛美上海",
    region: "A股",
    sector: "半导体设备",
    thesis: "清洗、电镀等设备覆盖先进封装与晶圆制造关键步骤",
    hardTags: ["清洗设备", "电镀设备", "先进封装"],
    quality: 8
  },
  {
    symbol: "688037.SS",
    name: "芯源微",
    region: "A股",
    sector: "半导体设备",
    thesis: "涂胶显影和清洗设备具备光刻前后道配套价值",
    hardTags: ["涂胶显影", "清洗设备", "国产替代"],
    quality: 7
  },
  {
    symbol: "300666.SZ",
    name: "江丰电子",
    region: "A股",
    sector: "硅片/材料",
    thesis: "高纯溅射靶材处于晶圆制造材料核心环节",
    hardTags: ["靶材", "高纯材料", "国产替代"],
    quality: 7
  },
  {
    symbol: "300054.SZ",
    name: "鼎龙股份",
    region: "A股",
    sector: "硅片/材料",
    thesis: "CMP 抛光垫、抛光液等材料进入晶圆制造关键耗材链条",
    hardTags: ["CMP材料", "抛光垫", "国产替代"],
    quality: 7
  },
  {
    symbol: "002185.SZ",
    name: "华天科技",
    region: "A股",
    sector: "先进封装",
    thesis: "封测平台型公司，受益国产封测需求和先进封装景气度",
    hardTags: ["封测平台", "先进封装", "国产替代"],
    quality: 6
  }
];

const NEWS_FEEDS = [
  {
    key: "headline",
    label: "日韩美半导体要闻",
    sourceClass: "全球聚合",
    reliability: 0.8,
    query: "semiconductor (Japan OR Korea OR United States OR Nvidia OR Samsung OR Hynix OR Tokyo Electron)",
    maxAgeDays: 45
  },
  {
    key: "materials",
    label: "原材料/供应紧缺",
    sourceClass: "供应链",
    reliability: 0.86,
    query: "(semiconductor materials shortage OR HBM shortage OR silicon wafer shortage OR photoresist shortage OR neon gas semiconductor)",
    maxAgeDays: 180
  },
  {
    key: "earnings",
    label: "财报与业绩分析",
    sourceClass: "财报业绩",
    reliability: 0.88,
    query: "(semiconductor earnings guidance revenue margin Nvidia Samsung Hynix Tokyo Electron)",
    maxAgeDays: 180
  },
  {
    key: "people",
    label: "重要人物预测",
    sourceClass: "人物观点",
    reliability: 0.72,
    query: "(Jensen Huang OR Lisa Su OR semiconductor CEO OR chip executive) (forecast OR outlook OR predicts)",
    maxAgeDays: 180
  },
  {
    key: "a_shares",
    label: "A股半导体",
    sourceClass: "中文市场",
    reliability: 0.76,
    query: "A股 半导体 芯片 国产替代 设备 材料 先进封装 HBM 财报",
    hl: "zh-CN",
    gl: "CN",
    ceid: "CN:zh-Hans",
    maxAgeDays: 180
  },
  {
    key: "korea_local",
    label: "韩国本土专业源",
    sourceClass: "韩国本土",
    reliability: 0.92,
    query: "(semiconductor OR chip OR HBM OR Samsung OR Hynix) (site:thelec.net OR site:kedglobal.com OR site:businesskorea.co.kr OR site:koreaherald.com OR site:etnews.com)",
    hl: "en-US",
    gl: "KR",
    ceid: "KR:en",
    maxAgeDays: 60
  },
  {
    key: "japan_local",
    label: "日本本土专业源",
    sourceClass: "日本本土",
    reliability: 0.92,
    query: "(半導体 OR semiconductor OR Tokyo Electron OR Advantest OR Renesas) (site:nikkei.com OR site:eetimes.itmedia.co.jp OR site:monoist.itmedia.co.jp OR site:semiconportal.com OR site:newswitch.jp)",
    hl: "ja",
    gl: "JP",
    ceid: "JP:ja",
    maxAgeDays: 60
  },
  {
    key: "x_signals",
    label: "X舆情信号",
    sourceClass: "X舆情",
    reliability: 0.48,
    query: "(semiconductor OR HBM OR Nvidia OR Samsung OR Hynix OR Tokyo Electron OR 半导体 OR 芯片) lang:en -is:retweet",
    provider: "x"
  }
];

const SECTOR_KEYWORDS = [
  { sector: "存储/HBM", words: ["hbm", "memory", "dram", "nand", "micron", "hynix", "samsung", "存储", "海力士", "三星", "兆易"] },
  { sector: "AI 加速器", words: ["ai chip", "gpu", "accelerator", "nvidia", "amd", "training", "inference", "ai芯片", "算力", "英伟达"] },
  { sector: "半导体设备", words: ["equipment", "lithography", "deposition", "etch", "tokyo electron", "applied materials", "lam research", "设备", "刻蚀", "薄膜", "清洗", "北方华创", "中微公司", "华海清科"] },
  { sector: "先进封装", words: ["advanced packaging", "cowos", "chiplet", "interposer", "substrate", "先进封装", "封测", "chiplet", "长电科技", "通富微电"] },
  { sector: "硅片/材料", words: ["wafer", "photoresist", "silicon", "neon", "materials", "chemical", "硅片", "光刻胶", "材料", "特气", "前驱体", "雅克科技"] },
  { sector: "车用/MCU", words: ["automotive", "mcu", "renesas", "power semiconductor", "sic", "汽车电子", "功率半导体", "韦尔股份", "mcu"] },
  { sector: "AI 网络/ASIC", words: ["ethernet", "networking", "asic", "broadcom", "switch", "网络芯片", "交换芯片"] },
  { sector: "晶圆制造/CPU", words: ["foundry", "fab", "intel", "smic", "晶圆", "代工", "中芯国际", "制造"] }
];

const HARD_LOGIC_WORDS = ["国产替代", "先进制程", "先进封装", "hbm", "HBM", "ai", "AI", "算力", "设备", "材料", "刻蚀", "薄膜", "前驱体", "特气", "晶圆", "封测"];
const EARNINGS_WORDS = ["财报", "业绩", "利润", "营收", "毛利率", "订单", "指引", "增长", "earnings", "revenue", "margin", "guidance", "profit"];
const RISK_WORDS = ["下调", "亏损", "减持", "制裁", "调查", "跌", "plunge", "loss", "cut", "weak", "sanction"];

let cache = {
  fast: { at: 0, data: null },
  detail: { at: 0, data: null }
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  res.end(body);
}

function fetchText(url, timeoutMs = 9000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const req = lib.get(url, {
      headers: {
        "user-agent": "Mozilla/5.0 semiconductor-daily-radar/1.0"
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchText(new URL(res.headers.location, url).toString(), timeoutMs));
        return;
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => resolve(raw));
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
    req.on("error", reject);
  });
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml, group, maxAgeDays, limit = 10) {
  const minTime = maxAgeDays ? Date.now() - maxAgeDays * 24 * 60 * 60 * 1000 : 0;
  return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => {
    const block = match[0];
    return {
      group,
      title: tag(block, "title"),
      source: tag(block, "source") || "Google News",
      link: tag(block, "link"),
      publishedAt: tag(block, "pubDate")
    };
  }).filter((item) => {
    if (!item.title || !item.link) return false;
    if (!minTime || !item.publishedAt) return true;
    const publishedTime = Date.parse(item.publishedAt);
    return Number.isFinite(publishedTime) && publishedTime >= minTime;
  }).slice(0, limit);
}

function withFeedMeta(feed, items) {
  return items.map((item) => ({
    ...item,
    sourceClass: feed.sourceClass,
    reliability: feed.reliability,
    weight: feed.reliability || 0.7
  }));
}

async function fetchXFeed(feed) {
  const token = process.env.X_BEARER_TOKEN;
  const monitorUrl = `https://x.com/search?q=${encodeURIComponent(feed.query)}&src=typed_query&f=live`;
  if (!token) {
    return {
      ...feed,
      items: [],
      monitorUrl,
      status: "需要配置 X_BEARER_TOKEN 后接入真实 X 实时搜索。"
    };
  }

  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(feed.query)}&max_results=10&tweet.fields=created_at,public_metrics`;
  const json = JSON.parse(await fetchTextWithHeaders(url, {
    authorization: `Bearer ${token}`,
    "user-agent": "Mozilla/5.0 semiconductor-daily-radar/1.0"
  }));
  const items = (json.data || []).map((tweet) => ({
    group: feed.key,
    title: tweet.text.replace(/\s+/g, " ").slice(0, 220),
    source: "X",
    link: `https://x.com/i/web/status/${tweet.id}`,
    publishedAt: tweet.created_at,
    engagement: tweet.public_metrics || {}
  }));
  return { ...feed, monitorUrl, items: withFeedMeta(feed, items) };
}

function fetchTextWithHeaders(url, headers, timeoutMs = 9000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const req = lib.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchTextWithHeaders(new URL(res.headers.location, url).toString(), headers, timeoutMs));
        return;
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => resolve(raw));
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Timeout fetching ${url}`)));
    req.on("error", reject);
  });
}

async function fetchNews(options = {}) {
  const itemLimit = options.itemLimit || 10;
  const settled = await Promise.allSettled(NEWS_FEEDS.map(async (feed) => {
    if (feed.provider === "x") return fetchXFeed(feed);
    const hl = feed.hl || "en-US";
    const gl = feed.gl || "US";
    const ceid = feed.ceid || "US:en";
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(feed.query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
    const xml = await fetchText(url);
    return { ...feed, items: withFeedMeta(feed, parseRss(xml, feed.key, feed.maxAgeDays, itemLimit)) };
  }));

  return settled.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    return { ...NEWS_FEEDS[index], items: [], error: result.reason.message };
  });
}

async function fetchStock(stock, options = {}) {
  const includeCandles = options.includeCandles !== false;
  const range = includeCandles ? "3mo" : "5d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.symbol)}?range=${range}&interval=1d`;
  const json = JSON.parse(await fetchText(url));
  const result = json.chart && json.chart.result && json.chart.result[0];
  if (!result) throw new Error(`No chart result for ${stock.symbol}`);
  const meta = result.meta || {};
  const quote = result.indicators.quote[0] || {};
  const closes = (quote.close || []).filter((value) => typeof value === "number");
  const last = Number(meta.regularMarketPrice || closes[closes.length - 1] || 0);
  const previous = Number(closes[closes.length - 2] || meta.chartPreviousClose || last);
  const changePct = previous ? ((last - previous) / previous) * 100 : 0;

  const payload = {
    ...stock,
    price: last,
    currency: meta.currency || "",
    exchange: meta.exchangeName || "",
    changePct,
    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null
  };
  if (includeCandles) payload.candles = buildCandles(result).slice(-42);
  return payload;
}

async function fetchStocks(options = {}) {
  const settled = await Promise.allSettled(STOCKS.map((stock) => fetchStock(stock, options)));
  return settled.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    return { ...STOCKS[index], price: null, currency: "", exchange: "", changePct: null, error: result.reason.message };
  });
}

function buildCandles(result) {
  const quote = result.indicators.quote[0] || {};
  const timestamps = result.timestamp || [];
  return timestamps.map((time, index) => {
    const open = quote.open?.[index];
    const high = quote.high?.[index];
    const low = quote.low?.[index];
    const close = quote.close?.[index];
    if (![open, high, low, close].every((value) => typeof value === "number")) return null;
    return {
      date: new Date(time * 1000).toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume: quote.volume?.[index] || 0
    };
  }).filter(Boolean);
}

async function fetchFundamentals(stock) {
  if (stock.region !== "A股") return null;
  try {
    const marketPrefix = stock.symbol.endsWith(".SZ") ? "SZ" : "SH";
    const code = stock.symbol.slice(0, 6);
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/ZYZBAjaxNew?type=0&code=${marketPrefix}${code}`;
    const json = JSON.parse(await fetchTextWithHeaders(url, {
      "user-agent": "Mozilla/5.0 semiconductor-daily-radar/1.0",
      referer: "https://emweb.securities.eastmoney.com/"
    }, 9000));
    const latest = (json.data || [])[0] || {};
    if (!latest.REPORT_DATE_NAME) throw new Error("No Eastmoney financial row");
    return {
      source: "东方财富 F10",
      period: latest.REPORT_DATE_NAME || "",
      noticeDate: latest.NOTICE_DATE || "",
      netIncome: numberOrNull(latest.PARENTNETPROFIT),
      netIncomeGrowthPct: numberOrNull(latest.PARENTNETPROFITTZ),
      netIncomeQoQPct: numberOrNull(latest.NETPROFITRPHBZC),
      revenue: numberOrNull(latest.TOTALOPERATEREVE),
      revenueGrowthPct: numberOrNull(latest.TOTALOPERATEREVETZ),
      grossMarginPct: numberOrNull(latest.XSMLL),
      status: "ok"
    };
  } catch (error) {
    return {
      source: "东方财富 F10",
      period: "",
      netIncome: null,
      netIncomeGrowthPct: null,
      netIncomeQoQPct: null,
      revenue: null,
      revenueGrowthPct: null,
      grossMarginPct: null,
      status: `财报接口暂不可用：${error.message}`
    };
  }
}

async function enrichAshareFundamentals(stocks) {
  const settled = await Promise.allSettled(stocks.map(async (stock) => {
    if (stock.region !== "A股") return stock;
    const fundamentals = await fetchFundamentals(stock);
    return { ...stock, fundamentals };
  }));
  return settled.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    return { ...stocks[index], fundamentals: { status: result.reason.message } };
  });
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function scoreSectors(stocks, feeds) {
  const textItems = feeds.flatMap((feed) => {
    return feed.items.map((item) => ({
      text: `${item.title} ${feed.label} ${item.sourceClass || ""}`.toLowerCase(),
      weight: item.weight || feed.reliability || 0.7
    }));
  });
  const sectors = SECTOR_KEYWORDS.map((entry) => {
    const newsHits = textItems.reduce((sum, item) => {
      const hits = entry.words.filter((word) => item.text.includes(word.toLowerCase())).length;
      return sum + hits * item.weight;
    }, 0);
    const sectorStocks = stocks.filter((stock) => stock.sector === entry.sector && typeof stock.changePct === "number");
    const avgMove = sectorStocks.length
      ? sectorStocks.reduce((sum, stock) => sum + stock.changePct, 0) / sectorStocks.length
      : 0;
    const shortageBoost = feeds.find((feed) => feed.key === "materials")?.items.some((item) => {
      const title = item.title.toLowerCase();
      return entry.words.some((word) => title.includes(word));
    }) ? 2 : 0;
    const score = Math.round((newsHits * 12 + Math.max(avgMove, -4) * 8 + shortageBoost * 10) * 10) / 10;
    return {
      sector: entry.sector,
      score,
      newsHits: Math.round(newsHits * 10) / 10,
      avgMove,
      rationale: buildRationale(entry.sector, newsHits, avgMove, shortageBoost)
    };
  });
  return sectors.sort((a, b) => b.score - a.score);
}

function buildRationale(sector, newsHits, avgMove, shortageBoost) {
  const parts = [];
  if (newsHits > 0) parts.push(`今日新闻出现 ${Number(newsHits).toFixed(1)} 次加权信号`);
  if (Math.abs(avgMove) >= 0.2) parts.push(`代表股票均值变动 ${avgMove.toFixed(2)}%`);
  if (shortageBoost) parts.push("供应/材料紧缺新闻提供额外催化");
  if (!parts.length) parts.push("暂无强信号，保持观察");
  return `${sector}：${parts.join("，")}。`;
}

function countWordHits(text, words) {
  const normalized = text.toLowerCase();
  return words.reduce((sum, word) => sum + (normalized.includes(word.toLowerCase()) ? 1 : 0), 0);
}

function scoreStockRecommendations(stocks, feeds, sectors) {
  const hotSectors = new Set(sectors.slice(0, 4).map((item) => item.sector));
  const newsText = feeds.flatMap((feed) => {
    return feed.items.map((item) => ({
      text: `${item.title} ${feed.label} ${feed.query || ""}`,
      weight: item.weight || feed.reliability || 0.7
    }));
  });

  return stocks
    .filter((stock) => stock.region === "A股")
    .map((stock) => {
      const relevantItems = newsText.filter((item) => {
        return countWordHits(item.text, [stock.name, stock.sector, ...(stock.hardTags || [])]) > 0;
      });
      const directNewsHits = Math.round(relevantItems.reduce((sum, item) => sum + item.weight, 0) * 10) / 10;
      const logicHits = countWordHits(`${stock.thesis || ""} ${(stock.hardTags || []).join(" ")} ${stock.sector}`, HARD_LOGIC_WORDS);
      const earningsHits = Math.round(relevantItems.reduce((sum, item) => {
        return sum + Math.min(3, countWordHits(item.text, EARNINGS_WORDS)) * item.weight;
      }, 0) * 10) / 10;
      const riskHits = Math.round(relevantItems.reduce((sum, item) => {
        if (!item.text.includes(stock.name) && !item.text.includes(stock.sector)) return sum;
        return sum + countWordHits(item.text, RISK_WORDS) * item.weight;
      }, 0) * 10) / 10;
      const momentum = typeof stock.changePct === "number" ? stock.changePct : 0;
      const sectorBonus = hotSectors.has(stock.sector) ? 18 : 0;
      const qualityScore = (stock.quality || 5) * 7;
      const score = Math.round((
        qualityScore +
        sectorBonus +
        directNewsHits * 5 +
        logicHits * 4 +
        earningsHits * 2.5 +
        Math.max(Math.min(momentum, 8), -8) * 2 -
        riskHits * 7
      ) * 10) / 10;

      return {
        ...stock,
        score,
        directNewsHits,
        logicHits,
        earningsHits,
        riskHits,
        rationale: buildStockRationale(stock, sectorBonus, logicHits, earningsHits, momentum, riskHits)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 18);
}

function buildStockRationale(stock, sectorBonus, logicHits, earningsHits, momentum, riskHits) {
  const parts = [stock.thesis || "细分领域具备跟踪价值"];
  if (sectorBonus) parts.push("所属板块进入今日高热度区间");
  if (logicHits) parts.push(`产业逻辑命中 ${logicHits} 个硬信号`);
  if (earningsHits) parts.push(`财报/订单/增长类信号 ${earningsHits} 个`);
  if (typeof momentum === "number" && Math.abs(momentum) >= 0.2) parts.push(`当日行情 ${momentum >= 0 ? "+" : ""}${momentum.toFixed(2)}%`);
  if (riskHits) parts.push(`需注意 ${riskHits} 个风险词`);
  return parts.join("；") + "。";
}

function buildSourceSummary(feeds) {
  return feeds.map((feed) => ({
    key: feed.key,
    label: feed.label,
    sourceClass: feed.sourceClass,
    reliability: feed.reliability,
    count: feed.items.length,
    status: feed.status || feed.error || "ok",
    monitorUrl: feed.monitorUrl || null
  }));
}

async function buildDashboard(options = {}) {
  const detail = options.detail === true;
  const [rawStocks, feeds] = await Promise.all([
    fetchStocks({ includeCandles: detail }),
    fetchNews({ itemLimit: detail ? 10 : 6 })
  ]);
  const stocks = detail ? await enrichAshareFundamentals(rawStocks) : rawStocks;
  const recommendations = scoreSectors(stocks, feeds);
  const stockRecommendations = scoreStockRecommendations(stocks, feeds, recommendations);
  const sourceSummary = buildSourceSummary(feeds);
  return {
    generatedAt: new Date().toISOString(),
    detail,
    stocks,
    feeds,
    sourceSummary,
    recommendations,
    stockRecommendations,
    caveat: "信息由公开财经与新闻源聚合生成，股票推荐为量化线索筛选，仅供研究参考，不构成投资建议。"
  };
}

function serveStatic(res, pathname) {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, normalized));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/dashboard") {
    const force = url.searchParams.get("refresh") === "1";
    const wantsDetail = url.searchParams.get("detail") === "1";
    const cacheKey = wantsDetail ? "detail" : "fast";
    const activeCache = cache[cacheKey];
    if (!force && activeCache.data && Date.now() - activeCache.at < 1000 * 60 * 10) {
      sendJson(res, 200, { ...activeCache.data, cached: true });
      return;
    }
    try {
      const data = await buildDashboard({ detail: wantsDetail });
      cache[cacheKey] = { at: Date.now(), data };
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 502, {
        error: "实时数据暂时不可用",
        detail: error.message,
        generatedAt: new Date().toISOString()
      });
    }
    return;
  }
  serveStatic(res, decodeURIComponent(url.pathname));
});

server.listen(PORT, HOST, () => {
  console.log(`Semiconductor Daily Radar running at http://${HOST}:${PORT}`);
});
