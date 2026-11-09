// Cloudflare Workers 入口範本：健康檢查 + OpenRouter 轉發占位
// 未部署、未測試；部署前需在 wrangler 設定 OPENROUTER_API_KEY secret
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, ts: new Date().toISOString() });
    }
    if (url.pathname === "/chat" && request.method === "POST") {
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
    return new Response("not found", { status: 404 });
  },
};
