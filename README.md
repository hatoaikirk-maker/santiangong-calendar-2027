# 2027 消防公益月曆｜電子書模擬

四湖參天宮 × 12 位消防員 × 搜救犬福星。A4 直式掛曆的翻頁預覽，內容對應《消防月曆_拍攝腳本_20261006.pptx》。

## 檔案
| 檔案 | 用途 |
|---|---|
| index.html / style.css / app.js | 前端：翻頁電子書 |
| days.json／days.js | 2027 每日農曆、國定假日、參天宮法會與節慶 |
| server.js | 後端：本機預覽伺服器＋`/api/days`（Node.js 內建，免安裝） |
| photos/ | 照片放這裡，檔名：cover.jpg、01.jpg ～ 12.jpg、back.jpg（沒放就顯示「照片待拍攝」） |

## 本機預覽
```
node server.js
```
瀏覽器開 http://localhost:8080（或直接雙擊 index.html 也可以看）

## 放上 GitHub Pages
1. GitHub 新增 repository（例如 `santiangong-calendar-2027`）
2. 把本資料夾全部檔案上傳（Add file → Upload files）
3. Settings → Pages → Branch 選 `main`、資料夾 `/ (root)` → Save
4. 約 1 分鐘後網址：`https://<你的帳號>.github.io/santiangong-calendar-2027/`

## 注意
- 國定假日依 2025 年《紀念日及節日實施條例》推算，實際放假以行政院人事行政總處公告為準。
- 參天宮法會：天赦日 4/29、開天門 7/9、下元節 11/12；關聖帝君聖誕 7/27（農曆六月廿四）。
- 照片為示意，正式版以 10/25 實拍照片替換。
