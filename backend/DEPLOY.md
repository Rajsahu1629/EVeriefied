# Deploy backend to AWS (EC2)

Your app points at: `http://15.207.85.85:3001/api`

The old server returns `Cannot POST /api/admin/login` because **admin routes are not deployed yet**. After deploy, admin login will work from the phone without running the backend on your Mac.

## 1. On your Mac — push latest code

```bash
cd /Users/rajsahu/Desktop/MyApp/EVeerified-Native
git add backend/
git commit -m "Add admin API routes and deploy config"
git push
```

If you deploy by copying files instead of git, skip push and use **rsync** in step 2.

## 2. SSH into EC2 and update the app

Replace `YOUR_KEY.pem` and `ubuntu@15.207.85.85` with your real key and SSH user (often `ubuntu` or `ec2-user`).

```bash
ssh -i YOUR_KEY.pem ubuntu@15.207.85.85
```

On the server (paths may differ — adjust if your folder is not `EVeerified-Native`):

```bash
cd ~/EVeerified-Native   # or wherever the repo lives
git pull

cd backend
npm install
npm run build
```

## 3. Set environment on the server

Edit `backend/.env` on EC2 (same variables as local):

```env
DATABASE_URL=postgresql://...your RDS URL...
PORT=3001

ADMIN_PHONE=9473928468
ADMIN_PASSWORD=Rajsahu@2000
ADMIN_API_SECRET=everified-admin-secret-change-me
```

Use a strong `ADMIN_API_SECRET` in production.

## 4. Restart the API process

**If you use PM2:**

```bash
cd backend
pm2 restart everified-api
# or first time:
# pm2 start dist/index.js --name everified-api
pm2 save
```

**If you use node directly:**

```bash
pkill -f "node dist/index.js" || true
cd backend && nohup node dist/index.js > ../api.log 2>&1 &
```

**If you use systemd:** `sudo systemctl restart everified`

## 5. Verify admin login on the server

```bash
curl -s -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9473928468","password":"Rajsahu@2000"}'
```

Expected: `{"success":true,"token":"..."}`

From your Mac:

```bash
curl -s -X POST http://15.207.85.85:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9473928468","password":"Rajsahu@2000"}'
```

If this still returns HTML `Cannot POST /api/admin/login`, the wrong folder was updated or the process was not restarted.

## 6. Point the React Native app at AWS

In the project root `.env`:

```env
EXPO_PUBLIC_API_URL=http://15.207.85.85:3001/api
```

Restart Expo:

```bash
npx expo start -c
```

## 7. Log in as admin

- Open **Recruiter Login**
- Phone: `9473928468`
- Password: `Rajsahu@2000` (capital **R**; `rajsahu@2000` also works after latest deploy)

## Security group

EC2 security group must allow inbound **TCP 3001** (or only from your IP while testing).

## Optional — deploy from Mac without git on server

```bash
rsync -avz --exclude node_modules --exclude dist \
  -e "ssh -i YOUR_KEY.pem" \
  ./backend/ ubuntu@15.207.85.85:~/EVeerified-Native/backend/

ssh -i YOUR_KEY.pem ubuntu@15.207.85.85 \
  'cd ~/EVeerified-Native/backend && npm install && npm run build && pm2 restart everified-api'
```
