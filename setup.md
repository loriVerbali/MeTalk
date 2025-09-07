# MeTalk Setup Instructions

## 1. Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Feature Flags
VITE_ENABLE_NSFW=true
VITE_ENABLE_FACE_CHECK=true

# Analytics
VITE_PLAUSIBLE_DOMAIN=metalk-demo.local
```

## 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Replace `your_gemini_api_key_here` in the `.env` file with your actual API key

## 3. Start Development Server

```bash
npm run dev
```

## 4. Test the Application

1. Open your browser to the local development URL (usually http://localhost:5173)
2. Upload a photo with exactly one face
3. Wait for avatar generation
4. Explore the feeling tiles
5. Test the TTS functionality
6. Try printing a collage

## 5. Features to Test

- ✅ Photo upload with drag & drop
- ✅ Avatar generation using Gemini
- ✅ 24 feeling tiles across 4 categories
- ✅ Tap-to-speak in EN/ES/PT
- ✅ High contrast mode toggle
- ✅ Keyboard navigation
- ✅ Print collage functionality
- ✅ Rate limiting (5-second cooldown)

## 6. Troubleshooting

### Avatar Generation Fails

- Check your Gemini API key is correct
- Ensure the uploaded image has exactly one face
- Check browser console for error messages

### TTS Not Working

- Ensure your browser supports Web Speech API
- Try different voice selections
- Check browser permissions for speech synthesis

### Images Not Loading

- Verify all feeling images are in the correct directories
- Check that image file names match the imports exactly

## 7. Production Deployment

For production deployment:

1. Update `VITE_PLAUSIBLE_DOMAIN` to your actual domain
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting service
4. Ensure HTTPS is enabled for Web Speech API to work
