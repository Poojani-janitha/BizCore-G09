# Backend Setup Guide

## ⚠️ Important: Node Modules Management

**`node_modules/` is NOT committed to the repository** for the following reasons:
- It's too large (5000+ files)
- Dependencies are managed through `package.json` and `package-lock.json`
- Each environment may need different native modules

## 🚀 First Time Setup

After cloning or pulling the repository:

```bash
# Navigate to backend directory
cd Shanel_ERP/backend

# Install dependencies
npm install
```

## ▶️ Running the Server

```bash
# Start the development server
npm start
# or
npm run dev
```

**The `ensure-deps.js` script will automatically:**
- Check if dependencies are installed
- Run `npm install` if any are missing
- Start the server with nodemon

## 📝 What Happens on Each Pull

1. **`node_modules/` will NOT be deleted** because it's in `.gitignore`
2. The `ensure-deps.js` script will verify dependencies are installed
3. If any packages are missing (e.g., after a new dependency is added to `package.json`), they'll be installed automatically

## 🔧 Troubleshooting

### If you see "Module not found" errors:

```bash
# Clear and reinstall all dependencies
rm -r node_modules package-lock.json
npm install
npm start
```

### If dependencies are outdated:

```bash
npm update
npm install
npm start
```

## 📦 Adding New Dependencies

When you add a new package:

```bash
npm install package-name
# Commit both package.json and package-lock.json
git add package.json package-lock.json
git commit -m "Add new dependency: package-name"
```

**DO NOT commit `node_modules/` to git**

## ✅ Verification

Confirm the setup is correct:

```bash
npm start
# You should see:
# ✅ Database connected with Sequelize
# Backend running on port 5000
```

---

**Remember:** Always run `npm start` or `npm run dev` to start the server. The ensure-deps script handles dependency verification automatically.
