# Hero Video Overlay Removal - Complete

## Changes Made

### Removed Video Overlay from Home Hero
The home hero component (`components/home/Hero.tsx`) had a video overlay with screen blend mode that has been completely removed.

### What Was Removed:

#### 1. Video Element
```tsx
{/* Screen-blend video overlay */}
<video
  ref={videoRef}
  className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-60"
  src="/bgoverlay2.mp4"
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  controls={isMobile}
/>
```

#### 2. Video Reference
```tsx
const videoRef = useRef<HTMLVideoElement>(null)
```

#### 3. Video Play Logic
```tsx
// Try to play video on mount (for browsers that allow it)
if (videoRef.current) {
  videoRef.current.play().catch(() => {
    // Autoplay blocked - user will need to interact
    console.log('Video autoplay blocked - controls available on mobile')
  })
}
```

## Current Hero Design

### What Remains:
- ✅ **Background Image Slider**: 6 rotating background images every 5 seconds
- ✅ **Dark Overlay**: `bg-near-black/40` for text readability
- ✅ **Gradient Vignettes**: Top and bottom gradients for better text contrast
- ✅ **All Text Content**: Headlines, subheadings, feature chips, CTAs
- ✅ **Interactive Elements**: Shop buttons, scroll indicator
- ✅ **Mobile Responsiveness**: All responsive design intact

### Visual Result:
- **Before**: Background images + video overlay with screen blend mode
- **After**: Clean background images with dark overlay only

## Benefits

1. **Improved Performance**: 
   - No video file loading (`/bgoverlay2.mp4`)
   - Reduced bandwidth usage
   - Faster page load times

2. **Better Compatibility**:
   - No autoplay issues across browsers
   - No mobile video control complications
   - Consistent experience on all devices

3. **Cleaner Design**:
   - Removes visual complexity from the screen blend effect
   - Better focus on the main content
   - More consistent with the overall design language

4. **Reduced Maintenance**:
   - No video file management
   - No video playback error handling
   - Simpler component logic

## Pages Affected

- ✅ **Home Page** (`app/page.tsx`): Uses the updated Hero component
- ✅ **Shop Page**: No changes needed (uses ShopHero which had no video)

The hero section now provides a clean, fast-loading experience with the rotating background images and all the original content, but without the video overlay complexity.