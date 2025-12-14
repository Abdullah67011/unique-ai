# 🚀 Vercel Deployment Guide - اردو/हिंदी

## ✅ Aapka AI Chat Project Tayyar Hai!

### 📁 Project Structure:
\`\`\`
your-project/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts      # AI Chat API
├── public/
│   ├── index.html            # Landing page
│   ├── chat.html             # Chat interface
│   ├── chat.js               # Frontend logic
│   └── chatgpt.png           # Hero image
└── package.json
\`\`\`

---

## 🚀 Deployment Steps (Step-by-Step):

### **1️⃣ GitHub pe Upload karein**

Apne terminal mein ye commands run karein:

\`\`\`bash
# Git initialize karein (agar pehle se nahi hai)
git init

# Sab files add karein
git add .

# Commit karein
git commit -m "AI Chat App ready for deployment"

# Main branch banayein
git branch -M main

# Apna GitHub repo connect karein (replace YOUR_USERNAME aur YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push karein
git push -u origin main
\`\`\`

---

### **2️⃣ Vercel pe Deploy karein**

1. **vercel.com** pe jao
2. **Sign in with GitHub** karein
3. **"Add New Project"** pe click karein
4. Apni repository **select** karein
5. **"Import"** pe click karein

---

### **3️⃣ Environment Variables Setup (Zaroori!)**

Vercel dashboard mein:

1. Project select karein
2. **Settings** tab pe jao
3. **Environment Variables** section mein jao
4. Ye 2 variables add karein:

| Variable Name | Value |
|--------------|-------|
| `CEREBRAS_API_KEY` | `csk-fthmtp5jrkfkjhfmvdtyjvkwx5jc95vnn8d5eenk42kkyxcw` |
| `CEREBRAS_URL` | `https://api.cerebras.ai/v1/chat/completions` |

5. **Save** karein
6. **Redeploy** karein (Deployments tab → 3 dots → Redeploy)

---

### **4️⃣ Testing**

- Aapka app live hai! URL kuch aisa hoga: `https://your-project.vercel.app`
- `/index.html` → Landing page
- `/chat.html` → AI Chat interface

---

## 🔧 Local Testing (Optional):

\`\`\`bash
# Dependencies install karein
npm install

# Local server start karein
npm run dev
\`\`\`

Browser mein jao: `http://localhost:3000`

---

## ⚠️ Important Points:

✅ **Kya karein:**
- Environment variables ko Vercel Dashboard mein add karein
- GitHub pe code push karein
- Vercel pe deploy button dabayein

❌ **Kya na karein:**
- `.env` file ko GitHub pe upload **MAT** karein
- API keys ko code mein hard-code **MAT** karein

---

## 🐛 Agar Problem Ho To:

### 1. **API not working:**
- Vercel Dashboard → Settings → Environment Variables check karein
- Sahi API key daala hai ya nahi confirm karein

### 2. **Deployment failed:**
- Deployments tab → Failed deployment → View Logs
- Error message dekh kar fix karein

### 3. **Chat not responding:**
- Browser console (F12) check karein
- Network tab mein API calls dekh karein

---

## 📞 Support:

- Vercel Docs: https://vercel.com/docs
- Cerebras API: https://cerebras.ai/docs

---

**Congratulations! 🎉 Aapka AI Chat App live hai!**

Koi sawal ho to pooch sakte hain! 😊
