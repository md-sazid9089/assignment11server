# Vercel Deployment Guide

## ✅ Backend Prepared for Vercel Deployment

### Changes Made:

#### 1. **index.js** - Entry Point Optimization
- ✅ Wrapped `app.listen()` in conditional to prevent execution in production
- ✅ Added `export default app` for Vercel serverless compatibility
- ✅ Enhanced CORS to support production URLs
- ✅ Added explicit CORS methods and headers

#### 2. **config/db.js** - MongoDB Connection Optimization
- ✅ Implemented connection caching to reuse existing connections
- ✅ Added `maxPoolSize` and `minPoolSize` for serverless limits
- ✅ Prevents `process.exit()` in production environment
- ✅ Returns cached connection when available (reduces Atlas connection count)

#### 3. **middleware/errorHandler.js** - Enhanced Error Handling
- ✅ Structured error logging for better Vercel logs visibility
- ✅ Always returns JSON responses (no HTML fallbacks)
- ✅ Improved error context (URL, method, timestamp)

#### 4. **vercel.json** - Deployment Configuration
- ✅ Uses `@vercel/node` for Node.js runtime
- ✅ Routes all HTTP methods to index.js
- ✅ Configured CORS headers at platform level
- ✅ Set to `iad1` region (US East - change if needed)

#### 5. **.vercelignore** - Deployment Optimization
- ✅ Excludes unnecessary files from deployment

---

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Set Environment Variables in Vercel Dashboard
Go to your Vercel project settings and add:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `CLIENT_URL` - Your frontend URL (e.g., https://yourdomain.vercel.app)
- `JWT_SECRET` - Your JWT secret key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase private key (include \n characters)

**Important:** In MongoDB Atlas, add `0.0.0.0/0` to IP whitelist for serverless functions.

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set root directory to `assignment11server`
4. Click "Deploy"

#### Option B: Via CLI
```bash
cd assignment11server
vercel
```

Follow the prompts to complete deployment.

### Step 4: Update Frontend API URL
Update your client `.env` file:
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## 🧪 Testing Your Deployment

### Test Basic Endpoint:
```bash
curl https://your-backend.vercel.app/
```

Expected response:
```json
{"message":"Uraan API is running"}
```

### Test API Endpoints:
```bash
curl https://your-backend.vercel.app/api/tickets
```

---

## ⚠️ Important Notes

### MongoDB Atlas Configuration:
1. **Network Access**: Add `0.0.0.0/0` to whitelist (required for serverless)
2. **Connection String**: Use `mongodb+srv://` format
3. **Connection Pooling**: Automatically handled by the optimized `db.js`

### Firebase Admin SDK:
- Store your Firebase private key in Vercel environment variables
- Use `JSON.parse(process.env.FIREBASE_PRIVATE_KEY)` if needed
- Ensure the private key includes proper line breaks

### Cold Start Optimization:
- First request may take 3-5 seconds (cold start)
- Subsequent requests are fast (<100ms)
- Connection caching minimizes MongoDB reconnection overhead

### Rate Limits:
- Vercel Free: 100GB bandwidth, 100 GB-hours compute
- Serverless function timeout: 10 seconds (Hobby), 60 seconds (Pro)

---

## 🔍 Monitoring & Debugging

### View Logs:
```bash
vercel logs your-deployment-url
```

Or check the Vercel dashboard for real-time logs.

### Common Issues:

**"Module not found"**
- Ensure all imports use `.js` extensions (ES Module requirement)
- Check `package.json` has `"type": "module"`

**MongoDB Connection Timeout**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check `MONGODB_URI` in Vercel environment variables

**CORS Errors**
- Add your production domain to `CLIENT_URL` environment variable
- Verify CORS configuration in `index.js`

**Firebase Auth Issues**
- Ensure `FIREBASE_PRIVATE_KEY` has proper line breaks
- May need to replace `\n` with actual newlines

---

## 📊 Performance Tips

1. **Keep Functions Warm**: Use a cron job or uptime monitor to ping your API every 5 minutes
2. **Optimize Bundle Size**: Only import what you need from libraries
3. **Database Indexing**: Ensure MongoDB collections have proper indexes
4. **Caching**: Implement Redis or similar for frequently accessed data
5. **Edge Caching**: Use Vercel's Edge Network for static responses

---

## 🎯 Next Steps

- [ ] Deploy backend to Vercel
- [ ] Test all API endpoints
- [ ] Deploy frontend with updated API URL
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerting
- [ ] Set up CI/CD pipeline

---

## 🆘 Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Stripe Docs: https://stripe.com/docs
