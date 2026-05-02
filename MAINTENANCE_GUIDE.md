# Abbas Threads - Complete Maintenance Guide

Maintaining a full-stack web application (React Frontend, Node.js/Express Backend, TiDB Database) requires a few simple but important habits. Follow this guide to ensure your website runs flawlessly without unexpected errors.

## 1. Safe Code Updates (GitHub Best Practices)
The most common cause of errors is pushing untested code directly to your live website.
* **Test Locally First:** Always run `npm run dev` and thoroughly test any new changes on `http://localhost:3002` before running `git push`.
* **Read Terminal Errors:** If your local server shows a red error in the terminal, fix it before pushing. A broken local server guarantees a broken live server.
* **Commit Often:** Use descriptive commit messages (e.g., `git commit -m "fix: updated search bar logic"`). This helps you track what changed if something suddenly breaks.

## 2. Managing Your Online Servers (Render.com)
Since your backend is hosted on Render, you need to monitor its health occasionally.
* **Check the Logs:** If the website is online but features are failing (like a 404 error or a frozen loading screen), go to your Render Dashboard, click your `abbas-threads-api` service, and read the **Logs** tab. It will tell you exactly what line of code crashed.
* **Manual Deploys:** If you push to GitHub but the live site hasn't updated after 10 minutes, Render might be paused. Go to Render and manually click **"Deploy latest commit"**.
* **Environment Variables:** If you ever change your Database password, Razorpay keys, or JWT secret, you MUST update them in Render's "Environment" tab. Your local `.env` file does not automatically sync to Render.

## 3. Database Maintenance (TiDB Cloud / MySQL)
Your database holds all your valuable customer data. 
* **Never Delete Without Backups:** If you plan to modify the structure of your database (like adding a new table or column), test the SQL command locally first.
* **Connection Limits:** Free tier databases sometimes have connection limits. If you see an error like `Too many connections` in your Render logs, it means the backend is overwhelmed. Restart the backend service on Render to clear the frozen connections.

## 4. Frontend & User Experience
The frontend is what your customers interact with.
* **Hard Refreshes (`Ctrl + F5`):** Browsers aggressively save (cache) old versions of your website to load faster. If you deploy a fix but can't see it online, do a Hard Refresh to force the browser to download the new files.
* **Monitor API Calls:** If data isn't showing up (like the Custom Designs missing), right-click your browser, click **Inspect**, and go to the **Console** or **Network** tab. Look for red text. A `401` means authentication failed, `404` means the backend route doesn't exist, and `500` means the backend crashed.

## 5. Security & Safety
* **Keep Secrets Secret:** NEVER upload your `.env` file to GitHub. If you accidentally expose your `RAZORPAY_KEY_SECRET` or `JWT_SECRET`, hackers can manipulate your payments or user accounts.
* **Update Dependencies Safely:** Periodically, you may want to run `npm update` to get security patches for your packages. However, major version updates can break things. Always test locally after updating.

## Emergency Checklist (If the site goes down)
1. **Is the database awake?** Log into TiDB Cloud and check if your cluster is active.
2. **Is the backend awake?** Go to Render and check the logs. Restart the server if necessary.
3. **Did a recent code push break it?** Check your GitHub commit history. You can always revert to a previous working commit if a new feature completely breaks the site.