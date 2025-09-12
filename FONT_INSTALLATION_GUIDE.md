# Local Font Installation Guide

## Quick Setup Steps

### 1. **Download Your Font Files**
- Get your font files in `.woff2` and `.woff` formats
- Place them in the `public/fonts/` directory

### 2. **Directory Structure**
```
public/fonts/
├── custom-serif/
│   ├── custom-serif-regular.woff2
│   ├── custom-serif-regular.woff
│   ├── custom-serif-bold.woff2
│   └── custom-serif-bold.woff
└── custom-sans/
    ├── custom-sans-regular.woff2
    ├── custom-sans-regular.woff
    ├── custom-sans-medium.woff2
    └── custom-sans-medium.woff
```

### 3. **Update Font Names in CSS**
In `src/app/globals.css`, replace:
- `'CustomSerif'` with your actual font name
- `'CustomSans'` with your actual font name
- Update the file paths to match your font files

### 4. **Use Fonts in Components**
- `font-display` - For headings and important text
- `font-serif` - For body text with serif styling
- `font-sans` - For regular sans-serif text

## Example: Installing "Playfair Display"

### 1. Download from Google Fonts
- Go to [fonts.google.com](https://fonts.google.com)
- Search for "Playfair Display"
- Download the font files

### 2. Update CSS
```css
@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/playfair-display/playfair-display-regular.woff2') format('woff2'),
       url('/fonts/playfair-display/playfair-display-regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 3. Update Tailwind Config
```css
--font-display: 'Playfair Display', 'Times New Roman', serif;
```

## Font Optimization Tips

### 1. **Use WOFF2 First**
- WOFF2 has better compression
- Modern browsers support it
- Always include WOFF as fallback

### 2. **Font Display Strategy**
- `font-display: swap` - Shows fallback first, then swaps to custom font
- Prevents invisible text during font load
- Good for performance

### 3. **Preload Critical Fonts**
Add to your `layout.tsx`:
```tsx
<link
  rel="preload"
  href="/fonts/custom-serif/custom-serif-regular.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### 4. **Subset Your Fonts**
- Only include characters you need
- Reduces file size significantly
- Use tools like [Glyphhanger](https://github.com/filamentgroup/glyphhanger)

## Testing Your Fonts

### 1. **Check Font Loading**
- Open browser DevTools
- Go to Network tab
- Look for font files loading
- Check for 404 errors

### 2. **Verify Font Rendering**
- Inspect elements in DevTools
- Check computed styles
- Ensure custom font is applied

### 3. **Test Fallbacks**
- Temporarily rename font files
- Verify fallback fonts display
- Check for layout shifts

## Common Issues & Solutions

### Font Not Loading
- Check file paths are correct
- Ensure files are in `public/fonts/`
- Verify file permissions

### Layout Shifts
- Use `font-display: swap`
- Match fallback font metrics
- Preload critical fonts

### Performance Issues
- Optimize font files
- Use font subsets
- Consider system fonts for body text

## Recommended Fonts for Your Design

### Serif (Headings)
- **Playfair Display** - Elegant, modern serif
- **Lora** - Readable, friendly serif
- **Crimson Text** - Classic, book-like serif

### Sans-serif (Body)
- **Inter** - Clean, modern sans-serif
- **Poppins** - Friendly, rounded sans-serif
- **Source Sans Pro** - Professional, readable

## Next Steps

1. **Choose your fonts** based on your brand
2. **Download the font files** in WOFF2/WOFF formats
3. **Update the CSS** with your font names and paths
4. **Test the implementation** in your browser
5. **Optimize for performance** with preloading and subsets
