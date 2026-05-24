# Destiny Pillars ☯

A BaZi (Four Pillars of Destiny) app for the North American market.  
Built with React Native (Expo) + Node.js backend + DeepSeek AI.

---

## What This App Does

Users enter their name, date of birth, time of birth, and gender.  
The app calculates their **Four Pillars of Destiny (BaZi 八字)** — an ancient Chinese astrological system — and uses AI to generate a personalized destiny reading covering:

- Overall Destiny & Life Theme
- Personality & Character
- Career & Wealth
- Love & Relationships
- Health & Vitality
- Lucky Elements & Colors

---

## Project Structure

```
destiny-pillars/
├── app/                    # React Native app (Expo)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── SplashScreen.js    # Animated intro screen
│   │   │   ├── HomeScreen.js      # Birth data entry form
│   │   │   └── ResultScreen.js    # Chart + AI reading
│   │   ├── components/
│   │   │   ├── BaziChart.js       # Four Pillars chart table
│   │   │   └── LoadingSpinner.js  # Animated loading indicator
│   │   ├── services/
│   │   │   └── api.js             # Backend API calls
│   │   └── theme.js               # Colors, fonts, spacing
│   ├── App.js                     # Navigation setup
│   ├── app.json                   # Expo configuration
│   └── package.json
├── backend/                # Node.js / Express API server
│   ├── server.js           # Server entry point
│   ├── routes/
│   │   └── bazi.js         # /api/bazi/calculate and /api/bazi/interpret
│   ├── utils/
│   │   └── baziCalculator.js  # BaZi calculation engine
│   ├── .env.example        # Environment variables template
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Step 1 — Prerequisites

Install the following free tools on your Mac:

1. **Node.js** — https://nodejs.org (download the LTS version)
2. **Expo Go** — install on your iPhone from the App Store (for testing)
3. **Git** — comes pre-installed on Mac, or install from https://git-scm.com

Optional (for App Store publishing):
- **Xcode** — free from the Mac App Store (needed for iOS builds)
- **Apple Developer Account** — $99/year at https://developer.apple.com

---

### Step 2 — Get a DeepSeek API Key (for AI readings)

1. Go to https://platform.deepseek.com/api_keys
2. Create a free account
3. Click **Create new API key**
4. Copy the key — you'll need it in Step 4

---

### Step 3 — Set Up the Backend Server

Open Terminal on your Mac and run these commands one by one:

```bash
# Navigate into the backend folder
cd /path/to/destiny-pillars/backend

# Install dependencies
npm install

# Copy the environment file template
cp .env.example .env
```

Then open the `.env` file in TextEdit (or any text editor) and replace `your_deepseek_api_key_here` with your actual API key:

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

Start the backend server:

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════╗
║       Destiny Pillars Backend            ║
║       Running on port 3001               ║
╚══════════════════════════════════════════╝
```

Keep this Terminal window open while using the app.

---

### Step 4 — Run the App on Your iPhone

Open a **new** Terminal window and run:

```bash
# Navigate into the app folder
cd /path/to/destiny-pillars/app

# Install dependencies
npm install

# Start the Expo development server
npm start
```

A QR code will appear in the terminal.

1. Open **Expo Go** on your iPhone
2. Tap **Scan QR Code**
3. Scan the QR code from the terminal
4. The app will open on your phone!

---

### Step 5 — Test the App

1. Enter any name, date of birth, and gender
2. Tap **Reveal My Destiny**
3. You should see the Four Pillars chart and an AI-generated reading

---

## Publishing to the iOS App Store

### Step 1 — Create the App Icon

You need a 1024×1024 PNG image for the app icon.

- See `app/assets/README.txt` for design guidelines
- Tools: Canva (https://canva.com) or hire a designer

Place it at: `app/assets/icon.png`

### Step 2 — Install EAS CLI (Expo's build tool)

```bash
npm install -g eas-cli
eas login
```

### Step 3 — Create an Expo Account

Sign up free at https://expo.dev

### Step 4 — Configure the App

Update `app/app.json`:
- Change `"your-eas-project-id-here"` to your actual Expo project ID (shown after `eas init`)

```bash
cd app
eas init
```

### Step 5 — Build for iOS

```bash
eas build --platform ios
```

This will:
1. Ask you to log into your Apple Developer account
2. Handle code signing automatically
3. Build the app on Expo's cloud servers (takes ~10-15 minutes)
4. Give you a download link when done

### Step 6 — Submit to App Store

```bash
eas submit --platform ios
```

This submits the build directly to App Store Connect.

Then go to https://appstoreconnect.apple.com to:
1. Fill in the app description, screenshots, pricing
2. Submit for Apple's review (typically 1-3 days)

---

## Deploying the Backend to Production

For real users, the backend needs to be deployed to a server (not your laptop).

### Option 1 — Railway (easiest, free tier available)

1. Go to https://railway.app
2. Connect your GitHub account
3. Click **New Project → Deploy from GitHub**
4. Select the backend folder
5. Add environment variable: `DEEPSEEK_API_KEY=your_key`
6. Railway gives you a URL like `https://your-app.railway.app`

### Option 2 — Render

Similar to Railway: https://render.com

### After Deploying

Update the backend URL in `app/src/services/api.js`:

```javascript
// Change this line:
export const BACKEND_URL = 'http://localhost:3001';

// To your deployed URL:
export const BACKEND_URL = 'https://your-app.railway.app';
```

Then rebuild and resubmit the app.

---

## Troubleshooting

**"Could not reach the server" error in app:**
- Make sure the backend is running (`npm start` in the backend folder)
- Make sure your phone and computer are on the same Wi-Fi network
- Update `BACKEND_URL` in `app/src/services/api.js` to use your computer's local IP address instead of `localhost`:
  - On Mac: go to System Preferences → Network to find your IP
  - Example: `http://192.168.1.100:3001`

**"DeepSeek API key not configured" error:**
- Check that your `.env` file in the backend folder has the correct API key
- Restart the backend server after changing `.env`

**App won't open in Expo Go:**
- Make sure you scanned the QR code while the Expo server (`npm start`) is running
- Try pressing `r` in the Expo terminal to reload

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 51 |
| Navigation | React Navigation 6 |
| Backend | Node.js + Express |
| AI | DeepSeek Chat API (streaming) |
| BaZi Engine | Custom JavaScript implementation |
| Streaming | Server-Sent Events (SSE) |

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0D1B2A` | Deep navy — all screen backgrounds |
| Gold | `#C9A84C` | Accents, buttons, highlights |
| Cream | `#FFF8DC` | Primary text |
| Wood | `#4CAF50` | Wood element |
| Fire | `#F44336` | Fire element |
| Earth | `#FF9800` | Earth element |
| Metal | `#9E9E9E` | Metal element |
| Water | `#2196F3` | Water element |

---

*Destiny Pillars — Ancient Chinese Wisdom for the Modern World*  
四柱命理 ☯
