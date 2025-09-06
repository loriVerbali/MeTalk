# MeTalk - AAC Demo

A playful web demo that lets AAC-using kids (ages 3–9) turn a photo into a cartoon avatar, then instantly view that avatar in pre-made feeling scenes grouped by simple categories. Tapping any tile speaks the feeling in EN/ES/PT.

## Features

- 📸 Upload a photo to generate a cartoon avatar using Gemini 2.5 Flash
- 🎭 Explore 24 different feelings across 4 categories
- 🗣️ Tap-to-speak using Web Speech API (EN/ES/PT)
- 🖨️ Print a collage of all feelings
- ♿ Full accessibility support (keyboard navigation, high-contrast mode)
- 🔒 Privacy-focused (no data storage, in-memory only)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ENABLE_NSFW=true
   VITE_ENABLE_FACE_CHECK=true
   VITE_PLAUSIBLE_DOMAIN=metalk-demo.local
   ```

3. **Generate feeling assets:**

   - Open `src/assets/feelings/placeholder-generator.html` in your browser
   - Click "Download All Images" to generate the 24 feeling background images
   - Place the downloaded PNG files in the `public/assets/feelings/` directory

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── routes/             # Page components
├── lib/                # Utility functions
├── state/              # Zustand store
├── types/              # TypeScript type definitions
├── assets/             # Static assets
└── styles/             # Global styles
```

## Key Components

- **Landing**: Welcome page with instructions
- **Upload**: Photo upload with moderation and face detection
- **AvatarReview**: Preview generated avatar
- **Board**: Main feelings exploration interface
- **PrintPreview**: Print collage generation

## Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Routing**: React Router
- **AI**: Google Gemini 2.5 Flash
- **TTS**: Web Speech API
- **PDF Generation**: jsPDF + html2canvas
- **Moderation**: nsfwjs + face-api.js
- **Analytics**: Plausible

## Accessibility Features

- Keyboard navigation (Tab, Enter, Space)
- High-contrast mode toggle
- Screen reader support
- Large touch targets (44px minimum)
- Focus indicators
- ARIA labels

## Session Limits

- Maximum 5 avatars per session
- 5-second cooldown between generations
- Session resets on page refresh

## Browser Support

- Chrome/Edge (recommended for best TTS support)
- Firefox
- Safari (limited TTS voice options)

## Development Notes

- All data is stored in memory only (no persistence)
- EXIF data is stripped from uploaded images
- Client-side moderation with NSFW detection
- Face detection ensures exactly one face per photo
- Responsive design optimized for desktop and tablet

## License

This is a demo project for educational purposes only. Not a medical device.
