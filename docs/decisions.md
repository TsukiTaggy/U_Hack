# Decision Log

บันทึกการเลือกของทีมสำหรับ SafeStart เพื่อให้การพัฒนาต่อและการ deploy ไม่หลุดจาก demo ที่ตกลงกันไว้

## 2026-10-15 — Demo and deployment decisions

### 1. ใช้ Avalanche Fuji เท่านั้น

- Network: Avalanche Fuji C-Chain
- Chain ID: `43113`
- ห้ามใช้เงินจริงหรือ mainnet
- Contract addresses ที่ deploy แล้วอยู่ใน environment configuration และควรตรวจซ้ำบน Fuji explorer ก่อน demo

### 2. บังคับใช้ Core wallet สำหรับ demo

- ผู้ใช้ต้องเชื่อม Core wallet ที่มีอยู่แล้วบน Avalanche Fuji ก่อนเริ่มใช้งาน
- เว็บไซต์ห้ามสร้าง, import, เก็บ หรือเติมเงินให้ wallet ของผู้ใช้
- ผู้ใช้รับ test AVAX เองจาก Avalanche Fuji faucet
- `MINTER_PRIVATE_KEY` ตั้งใจเว้นว่างใน demo mode
- ดังนั้น auto top-up ไม่อยู่ใน product และ auto certificate mint ฝั่ง server ยังไม่ใช่เส้นทางหลัก
- ถ้าจะออก certificate ใน demo ให้เรียก `SafeStartCert.mint(...)` ผ่าน Remix ด้วย owner wallet ที่ deploy contract

### 3. เลือก LLM แบบมี free tier

- ใช้ Gemini เป็น primary provider ผ่าน `LLM_API_KEY` + `LLM_MODEL`
- ใช้ Groq เป็น fallback ผ่าน `LLM_FALLBACK_API_KEY` + `LLM_FALLBACK_MODEL`
- ทุก provider ต้องผ่าน `lib/llm.ts`; ห้ามให้ client เห็น API key
- ถ้าไม่มี LLM key ให้แอปแสดง unavailable ตามที่ออกแบบไว้ ไม่ถือเป็น wallet failure

### 4. ElevenLabs ใช้เป็นเสียง scam simulation แบบ optional

- ใช้ ElevenLabs Agent ที่สร้างไว้สำหรับ voice experience
- มี text scam flow เป็น fallback เสมอ
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` เป็นค่าที่เปิดเผยได้สำหรับการระบุ agent
- `ELEVENLABS_API_KEY` เป็น secret และห้ามใส่ใน client หรือ commit
- `/play` ฝัง ElevenLabs Agent ผ่าน `@elevenlabs/react` แล้ว โดยใช้ voice เป็นค่าเริ่มต้นและมี text fallback
- Agent เปิด authentication; server ขอ signed URL ด้วย `ELEVENLABS_API_KEY` แล้วส่ง URL อายุสั้นให้ browser
- Transcript จาก voice ใช้ evaluator ตัวเดียวกับ text flow; UI ไม่ตัดสินผลเอง

### 5. Receipt security

- ใช้ `RECEIPT_SECRET` เป็น HMAC signing key สำหรับ pass receipts
- สร้างเป็น random 32-byte hex และต้องใช้ค่าเดิมตลอดการ deploy เดียวกัน
- เก็บเฉพาะใน `.env.local` และ Vercel Environment Variables
- ห้ามใส่ secret, API key หรือ private key ใน GitHub, README หรือแชตสาธารณะ

### 6. Environment handoff

- ไฟล์ env สำหรับส่งเพื่อนใช้เป็นช่องทาง private เท่านั้น
- local ใช้ `.env.local`; Vercel ใส่ผ่าน Project Settings → Environment Variables
- แก้ environment variables แล้วต้อง Redeploy
- ค่า `NEXT_PUBLIC_*` ถูกฝังตอน build จึงต้อง Redeploy หลังเปลี่ยน

## 2026-10-16 — Certificate ไม่บังคับสำหรับการส่งงาน

- Certificate (mint `SafeStartCert`) เป็น optional ไม่ใช่ส่วนบังคับของ demo หรือ submission
- Core demo คือ missions 1–4, AI coach และ `/learn`
- การ mint บน deployed URL ล้มเหลวเพราะ `MINTER_PRIVATE_KEY` ไม่ใช่ key ที่ถูกต้อง ทีมเลือกไม่แก้ก่อนส่งงาน

## สิ่งที่ไม่เปลี่ยนใน core demo

- Mission pass/fail ต้องตัดสินด้วย deterministic code ไม่ใช่ LLM
- Progress ใช้ signed receipts ใน browser ไม่เพิ่ม database
- AI ห้ามถือ signing key และห้ามส่ง transaction เอง
- ขอบเขตการสอนเป็น educational/testnet เท่านั้น ไม่ใช่ investment advice

## ลำดับงานถัดไป

1. ตรวจ `.env.local` และ Vercel env โดยไม่เปิดเผย secret
2. ทดสอบ `/play` ด้วย Core wallet จริงบน Fuji: connect → mission 1–4 → verify
3. ทดสอบ Coach ด้วย Gemini และ fallback ด้วย Groq
4. ทดสอบ certificate path ที่เลือกไว้: manual mint ผ่าน Remix แล้วตรวจบนหน้าเว็บ
5. ทดสอบ ElevenLabs voice บน deployed URL ด้วย Core wallet จริง; ถ้าไมค์หรือบริการไม่พร้อมให้ใช้ text mode
6. ทำ end-to-end smoke test ด้วย wallet ใหม่หลายใบ แล้ว freeze demo build
