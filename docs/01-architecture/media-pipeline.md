# Architecture: Direct-to-Cloud Media Pipeline

## 1. The Core Idea & The Concert VIP Pass Analogy
In traditional web development, file uploads follow the "Server Hop" pattern: the browser uploads a 5MB image to your Node.js backend, and your backend forwards it to a storage bucket. 

In a serverless, multi-tenant SaaS architecture, this creates two severe bottlenecks:
1. **Serverless Payload & Memory Caps:** Edge and serverless functions often have strict 4MB–10MB request payload limits.
2. **Double Bandwidth Cost:** You pay for bandwidth twice (Browser $\rightarrow$ Node, and Node $\rightarrow$ S3).

We solve this using **Direct-to-Cloud Presigned Uploads**.

### The Concert VIP Pass Analogy
Imagine a secure warehouse (your Cloudflare R2 bucket). You never give visitors the master warehouse key (your Cloudflare master API secret). 

Instead:
1. The visitor asks your office (your server): *"I want to store a pizza photo."*
2. Your office verifies their identity and hands them a **5-minute VIP Wristband** (a Presigned S3 URL) cryptographically signed by your secret. This ticket permits uploading **only** that exact file to **only** a designated shelf.
3. The visitor walks directly to the warehouse and drops off the file.
4. Your server uses **0MB of memory** handling the file transfer.

---

## 2. Visual Architecture Flow

[ Admin Browser ] ─── 1. RPC: getPresignedUploadUrl({ fileName, fileType, fileSize }) ───> [ TanStack Start Server ]
│
│ 2. Validates MIME type & size via Zod
│ 3. Namespaces key by tenantId
│ 4. Generates S3 PutObjectCommand (expires: 300s)
▼
[ Admin Browser ] <── 5. Returns { uploadUrl, publicUrl, objectKey } ─────────────────────────────┘
│
└─── 6. Direct HTTP PUT (Raw file bytes) ───────────────────> [ Cloudflare R2 Bucket ]
│ (CORS policy authorizes origin)
│
└─── 7. RPC: createProduct({ name, priceInCents, imageUrl }) ─> [ PostgreSQL products Table ]