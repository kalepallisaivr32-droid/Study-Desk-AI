# Study Desk AI

> 🖥️ An AI-powered web application that analyzes your study desk using Google Gemini Vision API — detecting objects, calculating a clutter score, and providing personalized organization suggestions.

![Study Desk AI Banner](https://img.shields.io/badge/Study%20Desk%20AI-Gemini%20Vision-2563EB?style=for-the-badge&logo=google&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-10B981?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)

---

## ✨ Features

- 📸 **Drag & Drop Image Upload** — JPG, PNG, JPEG, WEBP support
- 🤖 **Gemini Vision AI Analysis** — Powered by Google's Gemini 1.5 Flash
- 📊 **Clutter Score (0–100)** — Animated ring visualization
- 🏷️ **Organization Classification** — Clean / Moderately Organized / Messy
- 🔍 **Object Detection** — Identifies all items on your desk
- 📈 **Detailed Statistics** — Total objects, study materials, electronics, free space %
- 💡 **AI Suggestions** — Personalized recommendations to organize your desk
- 📱 **Fully Responsive** — Works on mobile and desktop

---

## 🚀 Live Demo

Deploy to GitHub Pages by following the steps below.

---

## 🔧 Setup & Usage

### Option 1: GitHub Pages (Recommended)

1. **Fork** or **clone** this repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

### Option 2: Local Development

```bash
# Clone the repo
git clone https://github.com/<your-username>/study-desk-ai.git
cd study-desk-ai

# Open in browser (no build step required!)
# Option A: Open index.html directly in Chrome/Firefox
# Option B: Use a local server
npx serve .
# or
python -m http.server 8080
```

---

## 🔑 API Key Setup

This app uses the **Google Gemini Vision API**. You need a free API key:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key (starts with `AIza...`)
4. On the **Analyze Desk** page, paste the key into the API key field and click **Save Key**

> **Security Note:** Your API key is stored only in your browser's `sessionStorage` — it is never sent to any server other than Google's API. It clears when you close the tab.

---

## 📁 Project Structure

```
study-desk-ai/
├── index.html          # Home page
├── analyze.html        # Analyze Desk page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── app.js          # Shared utilities (navbar, animations)
│   └── analyze.js      # Analyze page logic + Gemini API
└── README.md
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Structure & Styling |
| Vanilla JavaScript | Logic & API calls |
| Google Gemini 1.5 Flash | Vision AI analysis |
| CSS Animations | Smooth UI transitions |
| GitHub Pages | Static hosting |

---

## 🎨 Design

- **Color palette:** Blue (#2563EB) + White + Cyan accents
- **Typography:** Inter + Space Grotesk (Google Fonts)
- **Style:** Glassmorphism, gradient text, animated SVG ring
- **UX:** Drag & drop, loading overlay with step indicators, toast notifications

---

## 📝 How It Works

1. **Upload** — Drag & drop or select a desk photo
2. **AI Analyzes** — Gemini Vision scans for objects, coverage, and clutter
3. **View Results** — Dashboard with score, stats, objects, and suggestions
4. **Organize** — Follow personalized recommendations

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for students everywhere*
