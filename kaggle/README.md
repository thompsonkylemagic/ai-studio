# Kaggle 批次作業

用途：主力免費 GPU，只跑批次（訓練、轉檔、大量推論），不做常駐服務。
額度：T4 x2，每週約 30 GPU 小時，單次最長 12 小時；以帳號 Settings 顯示為準。

前置：
1. Yuuri 在 Kaggle 完成手機驗證（GPU 與網路權限需要）。
2. 在 Kaggle Settings 產生 API token，存入安全儲存，本機設定為 ~/.kaggle/kaggle.json，不進 git。

流程：
1. notebook 或 script 放在本資料夾，輸入資料從 R2 或 Kaggle Dataset 讀。
2. 用 kaggle CLI 送出批次執行：kaggle kernels push / pull。
3. 成品先寫 /kaggle/working，再同步回 R2 保存；session 結束後本機檔案不保留。
4. 每次執行記錄用了多少 GPU 小時，避免月底前把週額度燒完。

Colab 備援：手動開啟同一份 notebook 執行，不做自動排程（免費版排程已停用，閒置約 90 分鐘斷線）。
