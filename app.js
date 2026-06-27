const state = {
  data: null,
  region: "全部",
  sector: "全部",
  feed: "all",
  sourceClass: "all",
  detailLoading: false
};

const els = {
  status: document.querySelector("#status"),
  refresh: document.querySelector("#refreshButton"),
  region: document.querySelector("#regionFilter"),
  sector: document.querySelector("#sectorFilter"),
  feed: document.querySelector("#feedFilter"),
  source: document.querySelector("#sourceFilter"),
  recommendations: document.querySelector("#recommendations"),
  hardPicks: document.querySelector("#hardPicks"),
  sourceSummary: document.querySelector("#sourceSummary"),
  stocks: document.querySelector("#stocks"),
  news: document.querySelector("#news"),
  topSector: document.querySelector("#topSector"),
  topRationale: document.querySelector("#topRationale"),
  newsCount: document.querySelector("#newsCount"),
  stockCount: document.querySelector("#stockCount"),
  updatedAt: document.querySelector("#updatedAt"),
  caveat: document.querySelector("#caveat")
};

function formatTime(value) {
  if (!value) return "--:--";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatPrice(stock) {
  if (typeof stock.price !== "number") return "暂无";
  return `${stock.currency || ""} ${stock.price.toLocaleString(undefined, {
    maximumFractionDigits: stock.price > 1000 ? 0 : 2
  })}`;
}

function formatAmount(value) {
  if (typeof value !== "number") return "暂无";
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${(value / 100000000).toFixed(2)}亿`;
  if (abs >= 10000) return `${(value / 10000).toFixed(2)}万`;
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function formatPct(value) {
  if (typeof value !== "number") return "暂无";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function moveClass(value) {
  if (typeof value !== "number") return "neutral";
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function moveText(value) {
  if (typeof value !== "number") return "无数据";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function scoreWidth(score, maxScore) {
  if (!maxScore) return 4;
  return Math.max(4, Math.min(100, (score / maxScore) * 100));
}

function renderCandles(candles = []) {
  const data = candles.slice(-32);
  if (data.length < 3) {
    const text = state.data && !state.data.detail ? "K线同步中" : "K线暂无";
    return `<div class="mini-kline empty-kline">${text}</div>`;
  }
  const width = 260;
  const height = 94;
  const pad = 8;
  const lows = data.map((item) => item.low);
  const highs = data.map((item) => item.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;
  const step = (width - pad * 2) / data.length;
  const candleWidth = Math.max(3, Math.min(7, step * 0.58));
  const y = (value) => height - pad - ((value - min) / span) * (height - pad * 2);
  const nodes = data.map((item, index) => {
    const x = pad + index * step + step / 2;
    const openY = y(item.open);
    const closeY = y(item.close);
    const highY = y(item.high);
    const lowY = y(item.low);
    const up = item.close >= item.open;
    const color = up ? "#168c6a" : "#c44747";
    const rectY = Math.min(openY, closeY);
    const rectHeight = Math.max(2, Math.abs(closeY - openY));
    return `
      <line x1="${x.toFixed(1)}" y1="${highY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${lowY.toFixed(1)}" stroke="${color}" stroke-width="1"/>
      <rect x="${(x - candleWidth / 2).toFixed(1)}" y="${rectY.toFixed(1)}" width="${candleWidth.toFixed(1)}" height="${rectHeight.toFixed(1)}" fill="${up ? "rgba(22,140,106,0.18)" : color}" stroke="${color}" stroke-width="1"/>
    `;
  }).join("");
  const first = data[0].close;
  const last = data[data.length - 1].close;
  const rangeMove = first ? ((last - first) / first) * 100 : 0;
  return `
    <div class="mini-kline">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="近32日K线">${nodes}</svg>
      <span class="kline-caption">近32日 ${formatPct(rangeMove)}</span>
    </div>
  `;
}

function renderFinancials(stock) {
  const data = stock.fundamentals || {};
  const statusOk = data.status === "ok";
  const fallback = state.data && !state.data.detail ? "详细财务后台同步中" : "财务数据暂不可用";
  return `
    <div class="financial-strip">
      <div>
        <small>净利润</small>
        <strong>${formatAmount(data.netIncome)}</strong>
      </div>
      <div>
        <small>净利同比</small>
        <strong class="move ${moveClass(data.netIncomeGrowthPct)}">${formatPct(data.netIncomeGrowthPct)}</strong>
      </div>
      <div>
        <small>毛利率</small>
        <strong>${typeof data.grossMarginPct === "number" ? data.grossMarginPct.toFixed(2) + "%" : "暂无"}</strong>
      </div>
      <div>
        <small>报告期</small>
        <strong>${data.period || "暂无"}</strong>
      </div>
    </div>
    <div class="financial-source">${statusOk ? `${data.source} · ${data.noticeDate ? formatTime(data.noticeDate) : "已同步"}` : data.status || fallback}</div>
  `;
}

function renderRecommendations() {
  const recs = state.data.recommendations || [];
  const maxScore = Math.max(...recs.map((item) => item.score), 1);
  els.recommendations.innerHTML = recs.slice(0, 6).map((item, index) => `
    <article class="sector-card">
      <div class="sector-rank">${index + 1}</div>
      <h4>${item.sector}</h4>
      <strong>${item.score.toFixed(1)} 热度分</strong>
      <div class="score-line"><i style="width:${scoreWidth(item.score, maxScore)}%"></i></div>
      <p>${item.rationale}</p>
    </article>
  `).join("");

  if (recs[0]) {
    els.topSector.textContent = `今日最热细分板块：${recs[0].sector}`;
    els.topRationale.textContent = recs[0].rationale;
  }
}

function populateSectorFilter() {
  const sectors = [...new Set((state.data.stocks || []).map((stock) => stock.sector))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const current = state.sector;
  els.sector.innerHTML = `<option value="全部">全部</option>` + sectors.map((sector) => {
    return `<option value="${sector}">${sector}</option>`;
  }).join("");
  if (sectors.includes(current)) {
    els.sector.value = current;
  } else {
    state.sector = "全部";
  }
}

function populateSourceFilter() {
  const sourceClasses = [...new Set((state.data.sourceSummary || []).map((source) => source.sourceClass).filter(Boolean))];
  const current = state.sourceClass;
  els.source.innerHTML = `<option value="all">全部来源</option>` + sourceClasses.map((sourceClass) => {
    return `<option value="${sourceClass}">${sourceClass}</option>`;
  }).join("");
  if (sourceClasses.includes(current)) {
    els.source.value = current;
  } else {
    state.sourceClass = "all";
  }
}

function renderSourceSummary() {
  const sources = state.data.sourceSummary || [];
  els.sourceSummary.innerHTML = sources.map((source) => {
    const statusClass = source.status === "ok" || source.status === "external" ? "ok" : "warn";
    const statusLabel = source.status === "ok" ? "在线" : source.status === "external" ? "监测入口" : "需配置";
    const statusText = source.status === "ok" ? "已纳入评分模型。" : source.statusText || source.status;
    const monitor = source.monitorUrl
      ? `<a href="${source.monitorUrl}" target="_blank" rel="noreferrer">打开监测</a>`
      : "";
    return `
      <article class="source-card">
        <header>
          <strong>${source.label}</strong>
          <span class="source-pill ${statusClass}">${statusLabel}</span>
        </header>
        <div class="ticker">${source.sourceClass} · 权重 ${Math.round((source.reliability || 0) * 100)} · ${source.count} 条</div>
        <p>${statusText}</p>
        ${monitor}
      </article>
    `;
  }).join("");
}

function renderHardPicks() {
  const picks = state.data.stockRecommendations || [];
  const detailNote = state.data.detail ? "" : `<div class="empty detail-note">核心推荐已显示，K线、净利润和毛利率正在后台补全。</div>`;
  els.hardPicks.innerHTML = detailNote + (picks.map((stock, index) => `
    <article class="hard-pick-card">
      <div class="pick-rank">${index + 1}</div>
      <div class="pick-main">
        <header>
          <div>
            <h4>${stock.name}</h4>
            <div class="ticker">${stock.symbol} · ${stock.sector}</div>
          </div>
          <div class="pick-score">${stock.score.toFixed(1)}<small>硬度分</small></div>
        </header>
        <p>${stock.rationale}</p>
        ${renderCandles(stock.candles)}
        ${renderFinancials(stock)}
        <div class="tag-row">
          ${(stock.hardTags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="pick-metrics">
          <span>价格 ${formatPrice(stock)}</span>
          <span class="move ${moveClass(stock.changePct)}">${moveText(stock.changePct)}</span>
          <span>新闻 ${stock.directNewsHits}</span>
          <span>业绩 ${stock.earningsHits}</span>
        </div>
      </div>
    </article>
  `).join("") || `<div class="empty">暂无 A股推荐结果。</div>`);
}

function renderStocks() {
  const stocks = (state.data.stocks || []).filter((stock) => {
    const regionOk = state.region === "全部" || stock.region === state.region;
    const sectorOk = state.sector === "全部" || stock.sector === state.sector;
    return regionOk && sectorOk;
  });

  els.stocks.innerHTML = stocks.map((stock) => `
    <article class="stock-card">
      <header>
        <div>
          <strong>${stock.name}</strong>
          <div class="ticker">${stock.symbol} · ${stock.region}</div>
        </div>
        <span class="tag">${stock.sector}</span>
      </header>
      <div class="price">${formatPrice(stock)}</div>
      <div class="move ${moveClass(stock.changePct)}">${moveText(stock.changePct)}</div>
    </article>
  `).join("") || `<div class="empty">当前筛选无股票。</div>`;
}

function renderNews() {
  const feeds = state.data.feeds || [];
  const items = feeds
    .filter((feed) => state.feed === "all" || feed.key === state.feed)
    .filter((feed) => state.sourceClass === "all" || feed.sourceClass === state.sourceClass)
    .flatMap((feed) => feed.items.map((item) => ({ ...item, label: feed.label })));

  els.news.innerHTML = items.map((item) => `
    <article class="news-card">
      <a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a>
      <div class="news-meta">
        <span>${item.label} · ${item.sourceClass || "来源"} · ${item.source}</span>
        <time>${formatTime(item.publishedAt)}</time>
      </div>
    </article>
  `).join("") || renderNewsEmpty(feeds);

  els.newsCount.textContent = String(items.length);
}

function renderNewsEmpty(feeds) {
  const selected = feeds.find((feed) => feed.key === state.feed);
  if (selected && selected.monitorUrl) {
    return `<div class="empty">${selected.status || "该来源暂无实时结果。"} <a href="${selected.monitorUrl}" target="_blank" rel="noreferrer">打开 X 实时搜索</a></div>`;
  }
  return `<div class="empty">实时新闻暂时没有返回结果。</div>`;
}

function renderSummary() {
  const stockCount = (state.data.stocks || []).filter((stock) => typeof stock.price === "number").length;
  const allNews = (state.data.feeds || []).reduce((sum, feed) => sum + feed.items.length, 0);
  els.stockCount.textContent = String(stockCount);
  els.newsCount.textContent = String(allNews);
  els.updatedAt.textContent = formatTime(state.data.generatedAt);
  els.caveat.textContent = state.data.caveat || "公开数据聚合，仅供研究参考。";
}

function render() {
  if (!state.data) return;
  renderSummary();
  populateSectorFilter();
  populateSourceFilter();
  renderRecommendations();
  renderHardPicks();
  renderSourceSummary();
  renderStocks();
  renderNews();
}

async function loadDashboard(force = false) {
  els.refresh.disabled = true;
  els.status.textContent = "核心同步中";
  try {
    const response = await fetch(`/api/dashboard${force ? "?refresh=1" : ""}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "数据同步失败");
    state.data = data;
    els.status.textContent = data.cached ? "核心缓存" : "核心已同步";
    render();
    loadDashboardDetail(force);
  } catch (error) {
    els.status.textContent = "同步失败";
    els.topSector.textContent = "实时数据暂时不可用";
    els.topRationale.textContent = error.message;
    els.news.innerHTML = `<div class="empty">${error.message}</div>`;
  } finally {
    els.refresh.disabled = false;
  }
}

async function loadDashboardDetail(force = false) {
  state.detailLoading = true;
  els.status.textContent = "补全详细中";
  try {
    const params = new URLSearchParams({ detail: "1" });
    if (force) params.set("refresh", "1");
    const response = await fetch(`/api/dashboard?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "详细数据同步失败");
    state.data = data;
    els.status.textContent = data.cached ? "详细缓存" : "详细已同步";
    render();
  } catch (error) {
    els.status.textContent = "核心已显示";
    if (state.data) {
      state.data.caveat = `${state.data.caveat || "公开数据聚合，仅供研究参考。"} 详细数据稍后可刷新重试：${error.message}`;
      renderSummary();
    }
  } finally {
    state.detailLoading = false;
  }
}

els.refresh.addEventListener("click", () => loadDashboard(true));
els.region.addEventListener("change", (event) => {
  state.region = event.target.value;
  renderStocks();
});
els.sector.addEventListener("change", (event) => {
  state.sector = event.target.value;
  renderStocks();
});
els.feed.addEventListener("change", (event) => {
  state.feed = event.target.value;
  renderNews();
});
els.source.addEventListener("change", (event) => {
  state.sourceClass = event.target.value;
  renderNews();
});

loadDashboard();
setInterval(() => loadDashboard(true), 1000 * 60 * 15);
