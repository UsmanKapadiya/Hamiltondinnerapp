# Deployment Fix for MIME Type Error

## Problem
The error "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/html'" occurs when:
- The server returns HTML (usually index.html or 404 page) instead of JavaScript files
- This typically happens with SPA routing when the server doesn't properly handle client-side routes

## Solutions Applied

### 1. Updated `vite.config.js`
- Changed `base: './'` to `base: '/'`
- This ensures proper absolute path resolution for assets

### 2. Server Configuration Files Created

Depending on your deployment platform, use the appropriate configuration:

#### **Netlify** (Uses `netlify.toml` or `public/_redirects`)
- Files created: `netlify.toml` and `public/_redirects`
- Both files ensure all routes redirect to index.html

#### **Vercel**
- File created: `vercel.json`
- Configures rewrites for SPA routing

#### **Apache Server**
- File created: `public/.htaccess`
- Enables mod_rewrite for proper routing

#### **Nginx** (Manual Configuration Required)
Add this to your nginx configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### **IIS** (Manual Configuration Required)
Add this to your `web.config`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Steps to Deploy

1. **Rebuild the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your server**

3. **Ensure the appropriate configuration file is in place:**
   - For Netlify/Vercel: Configuration files are automatically detected
   - For Apache: Ensure `.htaccess` is in the root of your deployed files
   - For Nginx/IIS: Manually update server configuration

## If Deploying to a Subdirectory

If your app is deployed to a subdirectory (e.g., `https://example.com/myapp/`):

1. Update `vite.config.js`:
   ```javascript
   base: '/myapp/'  // Replace 'myapp' with your subdirectory name
   ```

2. Update `Router.jsx`:
   ```javascript
   <Router basename="/myapp">
   ```

3. Rebuild and redeploy

## Testing

After deployment:
1. Visit the root URL - should load correctly
2. Navigate to different routes using the app - should work
3. Refresh the page on any route - should not show 404
4. Check browser console for no module loading errors

## Common Issues

**Assets still not loading?**
- Clear browser cache
- Check network tab in DevTools to see what's being requested
- Verify the server is serving the correct MIME types:
  - `.js` files should be `application/javascript` or `text/javascript`
  - `.css` files should be `text/css`

**Different subdirectory?**
- Update the `base` configuration in `vite.config.js`
- Add `basename` to `BrowserRouter`

**Using HashRouter as alternative?**
- If server configuration is not possible, change `BrowserRouter` to `HashRouter` in `Router.jsx`
- This uses # in URLs (e.g., `/#/home`) and doesn't require server configuration
