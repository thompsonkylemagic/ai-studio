# ai-studio 創作產線：Kaggle 批次加工測試腳本
# 用途：在 Kaggle notebook 以單一 cell 貼上執行，驗證 GPU 加工 → 成品寫回作品庫（Worker /works）整條鏈。
# 前置：notebook 設定 Accelerator = GPU（T4 x2 或 P100），Internet = On（帳號已完成手機驗證）。

import subprocess, json, time, urllib.request

# 1) GPU 確認
print(subprocess.run(["nvidia-smi"], capture_output=True, text=True).stdout)

import torch
print("CUDA available:", torch.cuda.is_available())
gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only"

# 2) GPU 加工示範：大矩陣運算 + 產生一張測試圖存到 /kaggle/working
import numpy as np
from PIL import Image

t0 = time.time()
a = torch.randn(4096, 4096, device="cuda")
b = torch.randn(4096, 4096, device="cuda")
c = a @ b
torch.cuda.synchronize()
gpu_secs = time.time() - t0

arr = c[:512, :512].cpu().numpy()
arr = ((arr - arr.min()) / (arr.max() - arr.min()) * 255).astype("uint8")
Image.fromarray(arr).save("/kaggle/working/kaggle-gpu-test.png")
print(f"GPU matmul 4096x4096 done in {gpu_secs:.2f}s on {gpu_name}; image saved to /kaggle/working/kaggle-gpu-test.png")

# 3) 寫回作品庫（經 Worker API）
API = "https://ai-studio-api.kyletrump888.workers.dev"

def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        # 注意：Cloudflare 會以 error 1010 擋下 Python-urllib 的預設 User-Agent（2026-11-10 實測），
        # 必須帶自訂 User-Agent，否則連 /health 都回 403。
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (ai-studio kaggle batch)"},
    )
    with urllib.request.urlopen(req) as r:
        return r.status, json.loads(r.read().decode())

print("GET /health:", call("GET", "/health"))

status, work = call("POST", "/works", {
    "title": "kaggle-gpu-test",
    "kind": "image",
    "status": "draft",
    "source": "kaggle",
    "notes": f"Kaggle batch test on {gpu_name}; matmul 4096x4096 in {gpu_secs:.2f}s; output kaggle-gpu-test.png in notebook output",
})
print("POST /works:", status, work)

# 注意：Worker 轉回的是 Supabase REST 的陣列回應，作品在 work[0]，不是 dict。
wid = (work[0] if isinstance(work, list) else work)["id"]
print("POST version:", call("POST", f"/works/{wid}/versions", {"version": 1, "note": "kaggle batch test v1"}))
print("GET work:", call("GET", f"/works/{wid}"))
print("DONE work_id =", wid)
