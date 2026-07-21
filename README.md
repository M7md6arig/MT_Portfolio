# MT Portfolio — بورتفوليو تفاعلي سينمائي

موقع بورتفوليو شخصي بتجربة Scroll-driven storytelling: مشهد افتتاحي بكروت أعمال عائمة
تتحرك بـ Parallax مربوط 100% بالسكرول، عالم داخلي يعرض الأعمال والخدمات، وختام يعيد
مشهد البداية بزاوية معكوسة (قفل الدائرة).

## التقنيات

| الطبقة | التقنية |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Framer Motion (useScroll/useTransform) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | Zod |

## هيكلة المشروع

```
├── client/          # واجهة React (Vite)
│   └── src/
│       ├── assets/images/       # hero-portrait.png (استبدل الـ placeholder بملفك)
│       ├── components/          # common / layout / sections
│       ├── hooks/               # useScrollProgress, useParallax
│       ├── animations/          # variants.ts — كل الـ framer-motion variants
│       ├── data/                # constants.ts — كل النصوص والبيانات الـ placeholder
│       └── services/            # api.ts — axios + fallback تلقائي
├── server/          # Express API + Prisma
│   ├── src/         # config / controllers / routes / middlewares / services / validators
│   └── prisma/      # schema.prisma + seed.ts
├── shared/          # types مشتركة بين الطرفين
└── docker-compose.yml
```

## التشغيل محليًا

### المتطلبات
- Node.js 20+
- Docker (لقاعدة البيانات) أو PostgreSQL محلي

### 1. تثبيت الحزم
```bash
npm run install:all
```

### 2. إعداد البيئة
```bash
# انسخ ملفات البيئة وعدّل القيم لو احتجت
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env   # اختياري — الافتراضي localhost:4000
```

### 3. قاعدة البيانات
```bash
docker compose up -d db      # تشغيل PostgreSQL فقط
npm run db:migrate           # إنشاء الجداول
npm run db:seed              # admin + بيانات تجريبية
```

### 4. التشغيل
```bash
npm run dev                  # client (5173) + server (4000) معًا
```

> **ملاحظة:** الفرونتند يشتغل حتى بدون الباكند — `services/api.ts` يرجع تلقائيًا
> لبيانات placeholder من `data/constants.ts` لو الـ API مش متاح.

### تشغيل كل شيء بـ Docker
```bash
docker compose up --build    # db + server (مع migrate & seed تلقائي) + client
```

## API Endpoints

| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/api/projects?category=poster\|video\|motion\|website` | قائمة المشاريع |
| GET | `/api/projects/:id` | مشروع واحد |
| GET | `/api/services` | الخدمات |
| GET | `/api/social-links` | روابط التواصل |
| POST | `/api/contact` | إرسال رسالة |
| POST | `/api/auth/login` | تسجيل دخول الأدمن |
| POST/PUT/DELETE | `/api/projects` | إدارة المشاريع 🔒 (Bearer token) |

بيانات الأدمن الافتراضية (من seed): `admin@example.com` / `admin123` — غيّرها في `.env`.

## الصورة الشخصية

`client/src/assets/images/hero-portrait.png` حاليًا placeholder مولّد تلقائيًا.
استبدله بملفك الأصلي (PNG شفاف، 3968×4312) **بنفس الاسم** وسيظهر مباشرة في
الـ Hero والـ Closing فوق الخلفية الداكنة بدون أي container أو خلفية إضافية.

## تخصيص المحتوى

- كل نصوص الموقع والبيانات المؤقتة في ملف واحد: `client/src/data/constants.ts`
- كل الـ animation variants في: `client/src/animations/variants.ts`
- البيانات الحقيقية تُدار من قاعدة البيانات (seed أو لاحقًا من لوحة التحكم)
