# 免費 AI 工作室部署計畫（2026-11-09 查證）

結論：10 個工具能湊成一套可用的免費工作室，但分工和原清單有三處要修正。Sakupa 不是永久免費寄存，Cloady 和 Simular Box 的免費條件也比宣傳窄。真正能長期常駐的骨幹是 Cloudflare Workers + R2、Supabase、Cloady；GPU 兩家只能做批次作業，不能當常駐伺服器。

## 查證後的免費額度與限制

| 工具 | 實際免費額度 | 關鍵限制 |
|---|---|---|
| Kaggle | T4 x2（2×16GB）、每週約 30 GPU 小時、單次 session 最長 12 小時、29GB RAM、20GB 保存空間 | GPU 與網路要先做手機驗證；閒置會結束 session；額度以帳號 Settings 顯示為準 |
| Google Colab | T4 16GB（有空位才有）、單次最長 12 小時 | Google 不公布免費額度；閒置約 90 分鐘斷線；免費版排程筆記本已停用，自動化程度低，只適合當備援手動跑 |
| GitHub Actions | 公開 repo 標準 runner 不限分鐘；私有 repo 每月 2,000 分鐘、500MB artifact | GPU 與大型 runner 一律收費，不能用免費分鐘抵 |
| Simular Box | Box 本身免費，雲端 Linux 桌面 1 台，閒置自動睡眠、連線即喚醒；非官方實測約 4 核 / 8GB / 40GB | 模型呼叫消耗每日 credits（不累積）；接入方式是 MCP（https://mcp.box.simular.ai/mcp，OAuth 登入）；能否直連 Muse 要先實測，不能先假設 |
| Cloady | 免費 workspace 合計 0.5 vCPU / 1GB RAM / 5GB SSD，無需綁卡 | 免費只限部分區域（EU1、USE1 等）；有來源指出 2026-11 起新帳號改為首月免費，開通當下必須在頁面確認是 ongoing free 還是 trial；任一資源超限，整個 workspace 轉收費；閒置 7 天暫停 |
| Supabase | 2 個 active 專案、每專案 500MB 資料庫、1GB 檔案儲存、5GB egress、50,000 MAU | 閒置 1 週自動暫停且要手動恢復；免費版無自動備份；靠 Actions 定時 ping 保活 |
| OpenRouter | :free 模型 20 次/分鐘 | 未曾買過 credits 的帳號每天只有 50 次；曾買滿 US$10 credits 才升到每天 1,000 次，是否花這 10 美元由 Yuuri 決定 |
| Cloudflare Workers | 每天 100,000 requests | 每次執行 CPU 上限 10ms，只適合 API 路由、排程觸發、輕邏輯，不適合跑 AI 推論 |
| Cloudflare R2 | 10GB 儲存、每月 Class A 100 萬次 / Class B 1,000 萬次、egress 免費 | 超過 10GB 後每 GB-月 US$0.015 |
| Sakupa | 免費預覽連結 30 天（可續）、同時最多 3 個免費站、無需註冊帳號 | 不是永久免費：長期上線每站每月 ¥200 起；管理憑證存在本機，遺失要走 device / DNS 恢復，憑證必須另行備份；只收靜態網站 |

## 架構分工

常駐層：Workers 當 API 入口與路由，R2 存成品與素材，Supabase 存結構化資料，Cloady 跑一個小型常駐服務（例如 bot 或 webhook 接收器），靜態站長期寄存改用 Cloudflare Pages（免費且不限期），Sakupa 只用於 30 天預覽分享。

批次層：Kaggle 為主力 GPU，用 Kaggle API 從 Actions 或本機排程送 notebook 批次任務，成品寫回 R2；Colab 降為手動備援，不排自動排程。

模型層：OpenRouter 當統一模型 API，先用 :free 模型，預設每日上限按 50 次規劃。

自動化層：GitHub repo 存全部程式與設定，Actions 負責定時任務、Supabase 保活、觸發 Kaggle 批次、備份重要資料到 R2。

## 部署順序

第一階段（已備好骨架，見本資料夾）：repo 結構、Workers 路由範本、Actions 保活範本、Kaggle 批次說明、.env 範本。全部未連帳號前只算範本，未測試。

第二階段（需要 Yuuri 逐項授權）：依序接 Cloudflare、GitHub、Supabase、OpenRouter。每接一個就實測一個：Workers 部署後打一次請求、R2 上傳下載一個檔案、Supabase 建表讀寫一次、OpenRouter 用 :free 模型呼叫一次並記錄實際回應。

第三階段：Kaggle（Yuuri 需完成手機驗證，API token 走安全儲存）、Cloady（開通時確認 ongoing free 與區域）、Simular Box（先測 Muse 能否連上它的 MCP，連不上就改成 Yuuri 在其他 MCP 用戶端使用，不硬湊）、Sakupa（只發一個測試靜態站，憑證立即備份）。

## 風險原則

免費額度隨時會改或收緊，Cloady 與 Sakupa 都是 2025–2026 年的新小型服務，重要資料不在這兩家存唯一副本，一律在 R2 或 GitHub 留備份。任何 API key、token 都走安全儲存，不貼在對話裡。
