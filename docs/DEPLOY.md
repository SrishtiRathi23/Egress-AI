# Deployment

EgressAI deploys as a single container to **Cloud Run**, fronted by **Firebase
Hosting** which rewrites all traffic to the Cloud Run service. Replace
`YOUR_PROJECT_ID` and the region below with your own.

## Prerequisites

- `gcloud` authenticated as the project owner, and `firebase-tools` logged in to the same account.
- A GCP project with billing enabled.

## One-time project setup

New projects' default Compute service account lacks the roles Cloud Build needs,
which produces a confusing `403` on the first `--source` deploy. Grant them once:

```bash
P=YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com aiplatform.googleapis.com --project "$P"
SA="$(gcloud projects describe "$P" --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
for R in roles/storage.objectViewer roles/cloudbuild.builds.builder roles/artifactregistry.writer roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding "$P" --member="serviceAccount:$SA" --role="$R" --condition=None
done
```

`roles/aiplatform.user` is what lets the deployed service call Gemini via
Application Default Credentials. Without it the app still runs — it just falls
back to the deterministic engine.

## Deploy the backend (Cloud Run)

```bash
gcloud run deploy egress-ai --source . --region us-central1 --allow-unauthenticated --quiet \
  --project YOUR_PROJECT_ID \
  --set-env-vars USE_GEMINI=true,USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1
```

The `Dockerfile` builds the Next.js standalone output; the container listens on
`$PORT` (8080). No secrets are passed — Vertex authenticates via the service
account.

## Deploy the frontend (Firebase Hosting)

`firebase.json` rewrites every path to the Cloud Run service, so Hosting serves
the app from the CDN edge while the container does the work.

```bash
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

## Gotchas

- **Cloud Build 403 on first deploy:** the IAM grants above fix it.
- **Live Gemini stays dark:** confirm `roles/aiplatform.user` on the runtime
  service account and that `aiplatform.googleapis.com` is enabled.
- **`firebase deploy` permission errors:** the CLI must be logged in as an
  account with access to that exact project.
- **CSP and a future map layer:** if a tile-based map is added, its tile-host
  origins must be added to `img-src` in `next.config.ts`, or the map silently
  fails to load.
