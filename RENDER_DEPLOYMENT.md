# Render Deployment Guide for Oxiwell

## Issue Fixed: React Router Client-Side Routing + API 404 Errors

The "Not Found" error when refreshing protected routes and API 404 errors have been resolved by configuring proper SPA routing and API URLs on Render.

## Changes Made

### 1. Created `frontend/public/_redirects`
```
/*    /index.html   200
```
This tells Render to serve `index.html` for all routes, allowing React Router to handle client-side routing.

### 2. Updated `render.yaml`
Added frontend service with proper SPA routing configuration and **fixed API URL**:

```yaml
services:
  # Backend Service
  - type: web
    name: oxiwell-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    plan: free
    envVars:
      - key: FRONTEND_URL
        value: https://oxiwell-frontend.onrender.com

  # Frontend Service (NEW)
  - type: web
    name: oxiwell-frontend
    env: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    plan: free
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://oxiwell-backend.onrender.com/api  # FIXED: Added /api
```

## Critical Fix: API URL

**Problem**: The `VITE_API_URL` was missing `/api` causing 404 errors on all API calls.

**Before**: `https://oxiwell-backend.onrender.com`  
**After**: `https://oxiwell-backend.onrender.com/api` 

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix: Add SPA routing and correct API URL for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Render will automatically detect the updated `render.yaml`
   - Two services will be created:
     - `oxiwell-backend` (Node.js API)
     - `oxiwell-frontend` (Static site with SPA routing)

3. **Access URLs**:
   - Frontend: `https://oxiwell-frontend.onrender.com`
   - Backend API: `https://oxiwell-backend.onrender.com`

## What This Fixes

 **Public routes** (Home, About, Contact) work on refresh  
 **Protected routes** (Dashboard, Profile) work on refresh  
 **API calls** (prescriptions, appointments, etc.) work correctly  
 **Back button** works after refresh errors  
 **Direct URL access** to any route works  
 **Browser navigation** works properly  

## How It Works

1. **Server-Side**: Render serves `index.html` for all routes using the rewrite rule
2. **Client-Side**: React Router takes over and renders the correct component
3. **Authentication**: Protected routes still check authentication via React Router guards
4. **API Calls**: Frontend connects to backend via correct `VITE_API_URL` with `/api` path

## Environment Variables

The frontend will automatically use:
- `VITE_API_URL=https://oxiwell-backend.onrender.com/api` (set in render.yaml)

## Testing

After deployment, test these scenarios:
1. Navigate to any route and refresh the page
2. Use browser back/forward buttons
3. Access protected routes directly via URL
4. Test login flow and dashboard navigation
5. **Test API calls** (prescriptions, appointments, profile data)

All should work without "Not Found" or 404 errors.
