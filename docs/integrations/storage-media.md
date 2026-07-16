# Storage And Media Integrations

## Current Implementation

Supported storage drivers:

- `local`
- `s3`

Media features:

- Profile image upload
- Video intro upload
- Thumbnail generation through FFmpeg path
- Local/S3 URL normalization through API `/uploads/...`
- Deleted media cleanup settings

AI moderation is currently a feature flag; no external AI moderation provider is wired.

## Backend Environment

Local:

```env
STORAGE_DRIVER=local
API_BASE_URL=http://localhost:3000
```

S3:

```env
STORAGE_DRIVER=s3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_BASE_URL=https://<bucket-or-cdn-host>
API_BASE_URL=https://matchmate.webnza.com/api/v1
```

Media limits and tools:

```env
MEDIA_FFMPEG_PATH=
MEDIA_MAX_IMAGE_BYTES=10485760
MEDIA_MAX_VIDEO_BYTES=104857600
MEDIA_DELETED_CLEANUP_RETENTION_DAYS=7
MEDIA_DELETED_CLEANUP_LIMIT=100
MEDIA_AI_MODERATION_ENABLED=false
```

## S3 Setup

1. Create S3 bucket.
2. Keep bucket private unless intentionally serving public assets.
3. Create IAM policy for object read/write/delete and `HeadBucket`.
4. Configure `AWS_S3_BASE_URL`.
   - Can be S3 public URL if objects are public.
   - Prefer CloudFront/CDN URL for production.
5. Ensure API can proxy/read objects via `/uploads/...` when using private S3.

## Validation Steps

```bash
cd match-mate-api-server
npm run env:validate
npm run test -- storage.service.spec.ts
```

Manual smoke:

1. Start API with `STORAGE_DRIVER=local`; upload a profile image.
2. Confirm returned URL loads in mobile app.
3. Switch to `STORAGE_DRIVER=s3`; run API startup.
4. Confirm startup logs `S3 bucket access verified`.
5. Upload image and video.
6. Confirm delete removes the object.
7. If using video thumbnails, confirm `MEDIA_FFMPEG_PATH` points to a working ffmpeg binary.

## Common Failures

| Symptom                     | Check                                                      |
| --------------------------- | ---------------------------------------------------------- |
| API fails on startup        | S3 `HeadBucket` failed: bucket name, region, IAM           |
| Uploaded URL not visible    | `AWS_S3_BASE_URL`, CDN/public access, API `/uploads` proxy |
| Video thumbnail fails       | `MEDIA_FFMPEG_PATH` missing or binary not executable       |
| Production validation fails | Production expects `STORAGE_DRIVER=s3`                     |
