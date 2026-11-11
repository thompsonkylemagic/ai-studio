# 第一件真正作品草稿（K-pop，待 Yuuri 選定／修改）

狀態：已於 2026-11-11 在 Suno 生成並寫回作品庫（作品 id c34e5359-0ad5-4a21-b9a4-015d803a9173，status draft）。共 4 版：完整版 V6-MINI 1:11（https://suno.com/song/20c34528-5ba9-47c7-99fd-17f6995e455a ）與 1:27（https://suno.com/song/374d6bc6-af2d-4f85-88cc-faf6bc753eea ），已登記為作品庫 version 1、2；另有 2 版 1 分鐘 V6 PREVIEW（需升級才有完整版，未升級）。Suno 自動把 Style 裡的藝人名換成相似風格描述。
方向：2026-11-10 Yuuri 指定，K-pop，參考 LE SSERAFIM、IVE、BESTie、SNSD、MEOVV、RESCENE、aespa。
目的：展示站上線時不再只有 pipeline-test、worker-test、kaggle-gpu-test 三筆測試資料，先有一件可看的真正作品。

## 作品概念

- 工作標題：Midnight Signal（午夜訊號）
- 種類：music，狀態：draft
- 概念：一首夜裡發出訊號、等對方回應的 K-pop 舞曲，副歌短句重複、適合跟唱；編曲參考 LE SSERAFIM 的俐落鼓組與 IVE 的副歌旋律線，合成器音色參考 aespa，整體走明亮自信的路線，不是先前那條 lofi 純音樂。
- 語言：主歌英文、副歌韓文短句，Suno 容易唱準，也符合七團的混語習慣。

## Suno prompt（可直接貼）

K-pop dance-pop, confident and bright, punchy drums, groovy bassline, shimmering synths, catchy repetitive Korean hook in the chorus, clear female vocals, verse in English, pre-chorus build, explosive chorus, bridge with vocal harmony, 122 BPM, polished studio production, LE SSERAFIM and IVE inspired

## 歌詞草稿（原創，未抄任何一團的歌）

[Verse]
City lights are calling, I can hear them low
Every step I'm taking, yeah, I'm ready to go
No more waiting silent, no more holding back
Send it out tonight, follow the track

[Pre-chorus]
One light, two lights, burning in the dark
Can you hear the rhythm, can you feel the spark

[Chorus]
Midnight signal, 보내줘 (bonaejwo)
Midnight signal, 들리니 (deullini)
Call me back, call me back
Midnight signal, stay with me

[Bridge]
If the night is quiet, I'll turn it up loud
Your voice in the echo, rising through the crowd

[Chorus — repeat]
Midnight signal, 보내줘
Midnight signal, 들리니
Call me back, call me back
Midnight signal, stay with me

## 下一步（等 Yuuri 點頭再做）

1. Yuuri 選定或改標題、改一句歌詞，確認這首要不要當第一件。
2. 用 Suno 生成第一版，試聽後挑一版。
3. 成品寫回作品庫：POST https://ai-studio-api.kyletrump888.workers.dev/works，kind=music，status=draft，notes 寫 Suno 版本與參考團體。
4. 再回一句重啟展示站部署，Cloudflare Pages 上線後這件作品會即時出現在展示站上。
