# 創作產線計畫（2026-11-10 Yuuri 選定為第一個要做的成品）

目標：把免費 AI 工作室的九個可用工具串成一條創作產線。音樂方向是 K-pop（2026-11-10 Yuuri 指定），參考團體為 LE SSERAFIM、IVE、BESTie、SNSD、MEOVV、RESCENE、aespa；先前用 Suno 做 lofi 純音樂（參考〈Perfect Night〉）是另一條已完成的嘗試，產線的 prompt 與文案範本改以 K-pop 為準，也可延伸到圖像創作。

## 產線分工

- 進料與加工（GPU）：Kaggle 跑圖像生成、音訊分軌、轉檔等吃算力的加工；Colab 當臨時試作與 Kaggle 額度不足時的備援。
- 文案：OpenRouter 免費模型寫標題、文案、歌詞草稿（每天 50 次上限，排程要控制用量）。
- 作品庫：Supabase 存作品、版本與狀態（草稿／加工中／待發布／已公開），檔案先用 Supabase 1GB 儲存頂著（R2 未開通）。
- 常駐服務：Cloady 跑上傳接收與通知的小服務；第一次部署同時把免費層定案在 Yuuri AI Studio（EU1）。
- 對外入口：Cloudflare Worker ai-studio-api 當 API 入口；長期展示站用 Cloudflare Pages。
- 分享：新作品先用 Sakupa 從 Yuuri 自己電腦發 30 天預覽（Muse 環境的共用網路額度已滿，發不了）。
- 平台操作：Simular 雲端電腦操作只有網頁介面的創作平台（待 MCP 連線測試通過）。
- 自動化：GitHub Actions 每週整理作品庫、備份重要資料。

## 建造順序

1. Cloady 第一次部署：最小服務上線，免費層定案 EU1。（2026-11-10 完成：creative-hub 已 LIVE，網址 https://creative-hub-oxf4n3mu-yuuri-ai-studio.cloady.io ，workspace 標示 FREE、$0.00/mo。目前跑的是 Hello World 範本，之後換成產線的接收／通知服務。）
2. Supabase 建作品庫資料表（works、versions），Worker 加 /works 讀寫端點並實測。（2026-11-10 完成：兩表已建、RLS 開、anon 全部操作 policy，測試列 pipeline-test 在庫；Worker 已升級 v2 並部署，SUPABASE_URL 與 SUPABASE_ANON_KEY 已設定，/health、GET／POST /works、GET /works/<id>、/chat 回歸實測全過。/works 目前公開可讀寫，日後可加 token 上鎖。）
3. Kaggle 批次範本實跑一次：拿一個測試素材跑加工，成品寫回作品庫。（2026-11-10 完成：notebook ai-studio-kaggle-test 在 2 張 Tesla T4 上實跑，矩陣運算加工與測試圖產生成功，成品經 Worker API 寫回作品庫——作品 kaggle-gpu-test 與其 version 1 都已建立並回讀驗證。兩個踩坑已記錄：呼叫 Worker 必須帶自訂 User-Agent，否則被 Cloudflare 以 error 1010 擋下；POST /works 回傳的是陣列，取 id 要用 work[0]["id"]。腳本存於 ~/workspace/ai-studio-free-stack/kaggle/batch_test.py。）
4. Simular MCP 連線測試（OAuth，需 Yuuri 授權），通過後才把平台操作排進產線。（2026-11-11 完成：Yuuri 已完成 OAuth 授權，連線註冊為自訂連接器 custom.simular，實測可列出工具並讀到 box「main」；目前 client 只開放唯讀操作，之後產線要用開機、shell、瀏覽器或桌面操作時，再逐項經 Yuuri 授權加開。）
5. 展示站（Cloudflare Pages）與 Sakupa 預覽流程，排在有第一批成品之後。

## 限制

- OpenRouter 免費每天 50 次，文案步驟要批次合併，不要逐則呼叫。
- Cloady 免費 workspace 合計 0.5 vCPU／1GB RAM，服務只能做接收與通知，不做加工。
- 重要成品不在 Cloady／Sakupa 存唯一副本，一律回存 Supabase 或 GitHub。
