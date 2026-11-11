// Cloudflare Workers 入口 v3：健康檢查 + OpenRouter 轉發 + 創作產線作品庫（Supabase）+ CORS
// v3 與 v2 的唯一差別：所有回應加上 CORS 標頭並處理 OPTIONS 預檢，讓展示站（pages.dev）能跨來源讀取。
// 需要的綁定：OPENROUTER_API_KEY（secret）、SUPABASE_URL（變數）、SUPABASE_ANON_KEY（secret，publishable key）
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/health") {
      return Response.json({ ok: true, ts: new Date().toISOString() });
    }

    if (path === "/chat" && request.method === "POST") {
      const body = await request.text();
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body,
      });
      return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
    }

    // ---- 作品庫（Supabase REST） ----
    const sb = async (method, restPath, body, extraHeaders = {}) => {
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${restPath}`, {
        method,
        headers: {
          "apikey": env.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      return { status: res.status, data };
    };
    const json = (status, data) => Response.json(data, { status });

    if (path === "/works" && request.method === "GET") {
      const { status, data } = await sb("GET", "works?select=*&order=created_at.desc");
      return json(status, data);
    }
    if (path === "/works" && request.method === "POST") {
      const body = await request.json();
      if (!body.title) return json(400, { error: "title is required" });
      const row = {
        title: body.title,
        kind: body.kind || "music",
        status: body.status || "draft",
        source: body.source || null,
        notes: body.notes || null,
      };
      const { status, data } = await sb("POST", "works", row, { "Prefer": "return=representation" });
      return json(status, data);
    }

    const m = path.match(/^\/works\/([0-9a-fA-F-]{36})(\/versions)?$/);
    if (m) {
      const id = m[1];
      const isVersions = !!m[2];
      if (!isVersions && request.method === "GET") {
        const w = await sb("GET", `works?id=eq.${id}&select=*`);
        const v = await sb("GET", `versions?work_id=eq.${id}&select=*&order=version.asc`);
        if (w.status !== 200) return json(w.status, w.data);
        return json(200, { work: (w.data && w.data[0]) || null, versions: v.data || [] });
      }
      if (!isVersions && request.method === "PATCH") {
        const body = await request.json();
        const patch = {};
        for (const k of ["title", "kind", "status", "source", "notes"]) if (k in body) patch[k] = body[k];
        patch.updated_at = new Date().toISOString();
        const { status, data } = await sb("PATCH", `works?id=eq.${id}`, patch, { "Prefer": "return=representation" });
        return json(status, data);
      }
      if (isVersions && request.method === "POST") {
        const body = await request.json();
        if (!body.version) return json(400, { error: "version is required" });
        const row = {
          work_id: id,
          version: body.version,
          file_url: body.file_url || null,
          note: body.note || null,
        };
        const { status, data } = await sb("POST", "versions", row, { "Prefer": "return=representation" });
        return json(status, data);
      }
    }

    return new Response("not found", { status: 404 });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    const res = await handle(request, env);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(CORS)) out.headers.set(k, v);
    return out;
  },
};
