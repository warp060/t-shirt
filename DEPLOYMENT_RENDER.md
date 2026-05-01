# 🚀 Quick Deployment to Render

I've set up a **Blueprint configuration** (`render.yaml`) that will automatically create both your Frontend and Backend services on Render.com.

## 🛠️ Deployment Steps

1. **Push Changes to GitHub**:
   Ensure you have pushed the `render.yaml` file and all recent changes to your GitHub repository.

2. **Connect to Render**:
   - Go to [Render.com](https://dashboard.render.com/) and log in.
   - Click **"New +"** and select **"Blueprint"**.
   - Connect your GitHub repository.
   - Render will detect the `render.yaml` file and show you the services it's about to create.

3. **Configure Environment Variables**:
   Wait for the services to be created. You will need to go to the **Dashboard** for each service to fill in the sensitive data:

   ### 🌐 Backend (abbas-threads-api)
   Go to **Environment** tab and add:
   - `DB_HOST`: Your cloud database host (e.g., from Aiven)
   - `DB_USER`: Your cloud database user
   - `DB_PASSWORD`: Your cloud database password
   - `DB_NAME`: Your cloud database name
   - `GOOGLE_CLIENT_ID`: (Optional) Your Google Auth Client ID
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your App-specific password (not your main password)
   - `ADMIN_EMAIL`: Where you want to receive order alerts
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

   ### 💻 Frontend (abbas-threads-client)
   The `VITE_API_URL` is automatically configured to point to your backend. However, if you see connection issues, ensure it looks like `https://abbas-threads-api.onrender.com`.

## 📝 Important Notes

- **Database**: Since you are using MySQL, make sure your cloud database (Aiven) allows connections from Render's IP addresses (or set it to allow all `0.0.0.0/0` temporarily).
- **Free Plan**: The backend service will "spin down" after 15 minutes of inactivity on the free plan. The first request after a break might take 30-60 seconds to respond.
- **Routing**: I've added a rewrite rule (`/* -> /index.html`) to ensure your React routes work correctly on refresh.

---
**Need help with specific cloud database credentials?** Let me know!
