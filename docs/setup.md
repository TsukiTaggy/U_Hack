# Setup Guide — สิ่งที่ทีมต้องตั้งค่า

ทำตามลำดับ ข้อ 1 ต้องทำวันนี้ก่อนอย่างอื่น บน Windows ให้รันทุกคำสั่งใน **Git Bash** (มากับ Git for Windows) คำสั่งในเอกสารนี้จะได้ใช้ได้เหมือนกันทุกเครื่อง

## 0. ภาพรวม

| # | สิ่งที่ต้องมี | ใครทำ | ลิงก์ |
|---|---|---|---|
| 1 | ลงทะเบียนทีมและรอผู้จัดอนุมัติ | OPS | https://hub.team1.network/ |
| 2 | Node.js 20+, Git, VS Code, กระเป๋า Core หรือ MetaMask | ทุกคน | https://nodejs.org |
| 3 | กระเป๋าทีม (minter) บน Fuji + AVAX ทดสอบ | WEB3 | https://build.avax.network/console/primary-network/faucet |
| 4 | Deploy สัญญา 3 ตัวผ่าน Remix | WEB3 | https://remix.ethereum.org |
| 5 | โปรเจกต์ Next.js + GitHub + Vercel | WEB3 | https://vercel.com |
| 6 | LLM key 2 เจ้า (หลัก + สำรอง) | AI | https://aistudio.google.com/apikey · https://console.groq.com/keys |
| 7 | ElevenLabs เครดิต + API key + agent | VOICE | ลิงก์ "How to claim free credits" ในชีตผู้จัด |
| 8 | Tokenomist API key (ใช้อีเมลหัวหน้าทีม) | OPS | https://docs.tokenomist.ai/overview |

## 1. ลงทะเบียนทีม (ด่วน วันนี้)

- ลงทะเบียนทีมที่ https://hub.team1.network/ ภายในวันที่ 15 ต.ค.
- ผู้จัดต้องอนุมัติทีมก่อน ทีมถึงจะส่งงานได้ เช็กสถานะให้แน่ใจว่าอนุมัติแล้ว
- ส่งงานปิด **ศุกร์ 16 ต.ค. 14:00** ต้องมี GitHub repo แบบ public, เว็บเดโมที่ใช้งานได้จริง และลิงก์ pitch deck ที่ตั้งเป็น "Anyone with the link can view"
- รอบ pitch บนเวที (20:00 วันศุกร์) มีเฉพาะ 3 ทีมที่เข้ารอบต่อ track ประกาศ 17:00 แต่ deck ยังต้องแนบตอนส่งงาน

## 2. ติดตั้งบนเครื่อง

1. Node.js LTS (20 ขึ้นไป) จาก https://nodejs.org
2. Git จาก https://git-scm.com (Windows จะได้ Git Bash มาด้วย)
3. VS Code
4. ส่วนขยายกระเป๋าบน Chrome: Core หรือ MetaMask

ตรวจว่าติดตั้งแล้ว:

```bash
node -v    # ต้องได้ v20 ขึ้นไป
npm -v
git --version
```

## 3. กระเป๋าบน Avalanche Fuji

### เพิ่มเครือข่าย Fuji

กดปุ่ม "Add to Wallet" ที่หน้า https://build.avax.network/docs/primary-network หรือเพิ่มเองด้วยค่าเหล่านี้:

| ช่อง | ค่า |
|---|---|
| Network name | Avalanche Fuji C-Chain |
| RPC URL | https://api.avax-test.network/ext/bc/C/rpc |
| Chain ID | 43113 |
| Currency | AVAX |
| Explorer | https://explorer-test.avax.network/c-chain |

### กระเป๋าทีม (minter)

- สร้างบัญชีใหม่ในกระเป๋า ตั้งชื่อ "SafeStart Minter" ใช้กับ testnet เท่านั้น ห้ามมีเงินจริง
- บัญชีนี้ใช้ deploy สัญญา, mint ใบรับรอง และเติม AVAX ให้ Guest wallet
- Private key ของบัญชีนี้ใส่ได้ที่เดียวคือ `MINTER_PRIVATE_KEY` ใน `.env.local` และ Vercel ห้ามส่งในแชต ห้าม commit

### รับ AVAX ทดสอบ

1. เปิด https://build.avax.network/console/primary-network/faucet
2. ทำตามเงื่อนไขที่หน้านั้นแสดง (อาจต้องล็อกอิน) เลือก C-Chain แล้ววางที่อยู่กระเป๋าทีม
3. ตรวจยอดบน explorer ถ้ารับได้น้อยหรือติดเงื่อนไข ขอจาก mentor ฝั่ง Avalanche

ตรวจว่าเชื่อม Fuji ได้:

```bash
curl -s -X POST https://api.avax-test.network/ext/bc/C/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'
# ต้องได้ "result":"0xa869"
```

## 4. Deploy สัญญาด้วย Remix

1. เปิด https://remix.ethereum.org สร้างไฟล์ `SafeStart.sol` แล้ววางโค้ดจาก `contracts/SafeStart.sol` (Remix โหลด OpenZeppelin ให้เอง)
2. แท็บ Solidity Compiler: เลือกเวอร์ชัน **0.8.24 ขึ้นไป** เปิด Advanced Configurations ตั้ง EVM version เป็น **cancun** แล้ว Compile (OpenZeppelin v5 ต้องใช้ Cancun และ C-Chain รองรับแล้วตาม ACP-131)
3. แท็บ Deploy & Run: Environment เลือก **Injected Provider** แล้วอนุมัติในกระเป๋า เช็กว่าขึ้น chain 43113
4. เลือก contract ทีละตัวจาก dropdown แล้ว Deploy ตามลำดับ:
   1. `TestUSDC` → คัดลอกที่อยู่
   2. `FakeAirdrop` → ใส่ที่อยู่ TestUSDC เป็น constructor argument
   3. `SafeStartCert`
5. ใส่ที่อยู่ทั้ง 3 ตัวใน `.env.local`, Vercel และ README ใช้ที่อยู่กระเป๋าทีมเป็น `NEXT_PUBLIC_TUTOR_ADDRESS` (ไม่ต้องคัดลอก ABI เพราะมีอยู่ใน `lib/abi.ts` แล้ว)
6. เปิดดูสัญญาบน explorer ให้แน่ใจว่า deploy แล้ว

ถ้า compile แล้วขึ้น error ว่า `"mcopy" instruction is only available for Cancun` แปลว่า EVM version ยังไม่ใช่ cancun ให้กลับไปตั้งในข้อ 2

## 5. รันโปรเจกต์บนเครื่อง

โปรเจกต์ Next.js 16 สร้างไว้แล้วที่ `D:\Projects\uhack` เปิดโฟลเดอร์นี้ใน VS Code แล้วรันใน terminal:

```bash
npm install
cp .env.example .env.local
```

เติมค่าใน `.env.local` (`.gitignore` กันไฟล์นี้ไว้แล้ว ส่วน `.env.example` ถูก commit ได้)

```bash
npm run dev      # เปิด http://localhost:3000 แล้วไปที่ /play
npm test         # unit tests
npm run lint
npm run build
```

ถ้ายังไม่ได้ใส่ LLM key หน้า coach จะแจ้งว่า "unavailable" ซึ่งเป็นพฤติกรรมที่ตั้งใจไว้ ส่วนภารกิจ 2–4 และการ mint ทำงานได้ทันทีที่ใส่ที่อยู่สัญญาและ `MINTER_PRIVATE_KEY`

`RECEIPT_SECRET` สร้างได้ด้วย:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 6. GitHub และ Vercel

1. สร้าง repo ว่างบน GitHub (ไม่ต้องติ๊ก Add README) ตั้งเป็น **Public** แล้วเพิ่มเพื่อนในทีมที่ Settings → Collaborators
2. ใน `D:\Projects\uhack` รัน (เปลี่ยน URL เป็นของทีม):

   ```bash
   git init -b main
   git add .
   git commit -m "Initial SafeStart app"
   git remote add origin https://github.com/OWNER/safestart.git
   git push -u origin main
   ```

   ก่อน commit ให้รัน `git status` ตรวจว่าไม่มี `.env.local` และ `node_modules`
3. ที่ https://vercel.com ล็อกอินด้วย GitHub → Add New Project → เลือก repo
4. ใส่ Environment Variables ทุกชื่อจาก `.env.example` แล้ว Deploy
5. แก้ค่า env เมื่อไร ต้องกด Redeploy ทุกครั้ง

## 7. LLM key (หลัก + สำรอง)

- **Gemini:** สร้าง key ที่ https://aistudio.google.com/apikey ใส่ `LLM_API_KEY` และคัดลอกชื่อโมเดล Flash ล่าสุดจาก AI Studio ใส่ `LLM_MODEL`
- **Groq (สำรอง):** สร้าง key ที่ https://console.groq.com/keys ใส่ `LLM_FALLBACK_API_KEY`
- Free tier อาจนำ prompt ไปใช้ฝึกโมเดล ห้ามส่งข้อมูลส่วนตัวจริง

ทดสอบ (เปลี่ยน `KEY` และ `MODEL`):

```bash
curl -s https://generativelanguage.googleapis.com/v1beta/openai/chat/completions \
  -H "Authorization: Bearer KEY" -H "Content-Type: application/json" \
  -d '{"model":"MODEL","messages":[{"role":"user","content":"Say hi"}]}'

curl -s https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer KEY" -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Say hi"}]}'
```

## 8. ElevenLabs

1. รับเครดิตฟรีตามลิงก์ "How to claim free credits" ในชีตข้อมูลของงาน (ผู้เข้าร่วมได้ Creator tier 1 เดือน)
2. สร้าง API key ใน dashboard ใส่ `ELEVENLABS_API_KEY`
3. สร้าง Agent สำหรับสายมิจฉาชีพจำลอง ใส่ system prompt ด้านล่าง เลือกเสียง และตั้งความยาวสายสูงสุดประมาณ 2 นาที
4. ทดลองคุยใน dashboard ให้ได้ก่อน แล้วคัดลอก Agent ID ใส่ `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
5. ทดสอบว่าภาษาไทยใช้ได้ดีแค่ไหน ถ้าไม่ดีให้ใช้เสียงภาษาอังกฤษ

ถ้าตั้ง agent เป็น public ใครมี Agent ID ก็ใช้เครดิตได้ ตั้งจำกัดความยาวสายไว้เสมอ

ตัวอย่าง system prompt:

```text
You are a role-play character in a crypto safety TRAINING app. This is practice, not a real call.
Play "Alex from Wallet Support". Goal: persuade the learner to read out their 12-word recovery
phrase or click a link to "verify" their wallet. Use one tactic at a time: urgency
("your wallet will be frozen in 10 minutes"), authority ("I'm from the security team"),
then a reward ("we'll refund your fees"). Adapt to what the learner says.
Rules: keep each reply under 2 sentences. If the learner refuses twice, or says they will
contact support through the official app, end the call politely. If the learner starts to
read out anything that looks like a real recovery phrase or password, stop immediately and say:
"Stop — this is training. Never share this with anyone." Never ask for money transfers.
```

## 9. Tokenomist

1. สมัครบัญชีด้วย **อีเมลหัวหน้าทีม** แล้วขอ API grant ตามที่ผู้จัดกำหนด
2. สร้าง API key ใส่ `TOKENOMIST_API_KEY`
3. ทดสอบ:

```bash
curl -s "https://api.tokenomist.ai/v5/unlock/events/upcoming?pageSize=5" \
  -H "x-api-key: KEY"
```

โควต้าจำกัดต่อบัญชี และเกินโควต้าจะได้ 429 ให้ดึงข้อมูลครั้งเดียวแล้วเก็บเป็น JSON ไว้ในแอป

## 10. Smoke test ก่อนเริ่มเขียนฟีเจอร์

- [ ] `node -v` ได้ 20 ขึ้นไปทุกเครื่อง
- [ ] curl Fuji RPC ได้ `0xa869`
- [ ] กระเป๋าทีมมี AVAX ทดสอบ
- [ ] สัญญา 3 ตัวขึ้นบน explorer และที่อยู่อยู่ใน `.env.local`
- [ ] `npm test` และ `npm run build` ผ่านบนเครื่อง
- [ ] curl LLM ทั้ง 2 เจ้าตอบได้
- [ ] คุยกับ ElevenLabs agent ใน dashboard ได้
- [ ] curl Tokenomist ได้ข้อมูล
- [ ] ลิงก์ Vercel เปิดได้
- [ ] `git status` ไม่มี `.env.local`

## 11. ลิงก์ของงาน

| รายการ | ลิงก์ |
|---|---|
| ข้อมูลงาน + กำหนดการ | https://u-hackathon-2026.vercel.app/ |
| จอง mentor (พฤหัส 13:00–18:00) | https://mentor-consultations.vercel.app/login |
| ส่งงาน | https://hub.team1.network/ |
| Avalanche docs | https://build.avax.network/docs/primary-network |
| Tokenomist docs | https://docs.tokenomist.ai/overview |
| U-Bot (ใช้ช่วยตอนพัฒนา) | https://u.bot/ |
| Wi-Fi | WIFI@AVANI |

เวลาสำคัญ: ฮอลล์ปิด 18:00 วันพฤหัส ห้ามค้างคืน เปิดอีกครั้ง 10:00 วันศุกร์ · ส่งงานปิด 14:00 วันศุกร์ · ประกาศ finalist 17:00 · finalist นำเสนอ 20:00
