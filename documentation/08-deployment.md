# 🚀 Deployment Guide

StockHealth AI is optimized for deployment on **Vercel**, the creators of Next.js.

## 1. Prepare for Production

### Build Check
Before deploying, run the build locally to catch type errors:
```bash
npm run build
```
*   **Success**: `.next/` folder created.
*   **Failure**: Check the error logs (usually TypeScript or Linting errors).

### Environment Variables
Ensure you have all secrets ready. You will need to add these to the Vercel Project Settings.

| Variable | Description |
| :--- | :--- |
| `SNOWFLAKE_ACCOUNT` | Your Snowflake Account ID. |
| `SNOWFLAKE_USERNAME` | Service Account Username. |
| `SNOWFLAKE_PASSWORD` | Service Account Password. |
| `SNOWFLAKE_WAREHOUSE`| Compute Warehouse (e.g., `COMPUTE_WH`). |
| `SNOWFLAKE_DATABASE` | Database Name (`INVENTORYDB`). |
| `SNOWFLAKE_SCHEMA` | Schema Name (`PUBLIC`). |

---

## 2. Deploying to Vercel

1.  **Push to GitHub**: Ensure your code is pushed to a repository.
2.  **Import Project**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your `stockhealth-ai` repository.
3.  **Configure Project**:
    *   **Framework**: Next.js (Auto-detected).
    *   **Root Directory**: `./`.
    *   **Environment Variables**: Copy-paste your secrets here.
4.  **Deploy**: Click **"Deploy"**.

### Post-Deployment Verification
1.  Visit the production URL.
2.  Log in as a user.
3.  Check the "AI Insights" banner. If it loads, your Snowflake connection is successful.

---

## 3. Alternative Hosting

You can also deploy to AWS (Amplify/EC2), Azure (Static Web Apps), or Docker.

### Dockerfile
A `Dockerfile` is provided for containerized deployment.

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

Build and Run:
```bash
docker build -t stockhealth-ai .
docker run -p 3000:3000 --env-file .env.local stockhealth-ai
```
