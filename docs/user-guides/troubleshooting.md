# Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and resolve common issues you might encounter while using the LightBrush Website. Issues are organized by category with step-by-step solutions.

## Table of Contents

- [Performance Issues](#performance-issues)
- [3D Rendering Problems](#3d-rendering-problems)
- [Projection Simulator Issues](#projection-simulator-issues)
- [Game-Related Problems](#game-related-problems)
- [Browser and Compatibility Issues](#browser-and-compatibility-issues)
- [Audio and Visual Issues](#audio-and-visual-issues)
- [Network and Loading Problems](#network-and-loading-problems)
- [Frequently Asked Questions](#frequently-asked-questions)

---

## Performance Issues

### Low Frame Rate (FPS)

#### Symptoms
- Choppy or stuttering 3D animations
- Delayed response to user interactions
- FPS counter shows below 30 fps

#### Immediate Solutions
1. **Reduce Quality Settings**
   ```
   Settings → Graphics → Quality: High → Medium/Low
   Settings → Graphics → Disable Particles: ✓
   Settings → Graphics → Disable Animations: ✓
   ```

2. **Close Resource-Heavy Applications**
   - Close other browser tabs
   - Quit video streaming applications
   - Close design software (Photoshop, video editors)
   - Disable browser extensions temporarily

3. **Enable Performance Mode**
   - Press `F1` to open performance overlay
   - Click "Emergency Performance Mode" if available
   - Restart browser if issues persist

#### Advanced Solutions
```typescript
// Check hardware acceleration
1. Chrome: chrome://gpu → Verify "Hardware accelerated" is enabled
2. Firefox: about:config → layers.acceleration.force-enabled = true
3. Safari: Develop → Experimental Features → WebGL 2.0
```

#### Hardware-Specific Fixes

##### Integrated Graphics (Intel HD, AMD APU)
- Set graphics quality to "Low"
- Disable all particle effects
- Reduce browser zoom to 75%
- Enable "Reduce Motion" in accessibility settings

##### Older GPUs (5+ years old)
- Force WebGL 1.0 instead of WebGL 2.0
- Disable post-processing effects
- Use "Potato" quality mode if available
- Consider using a different browser

##### Mobile Devices
```typescript
Mobile Optimization:
├─ Enable "Low Power Mode" in device settings
├─ Close all background apps
├─ Use landscape orientation for better performance
├─ Avoid charging while using (reduces thermal throttling)
└─ Clear browser cache if performance degrades
```

### High Memory Usage

#### Symptoms
- Browser becomes sluggish after extended use
- System freezes or crashes
- Memory usage warning in performance overlay

#### Immediate Solutions
1. **Refresh the Page**
   - Press `Ctrl+F5` (hard refresh)
   - This clears Three.js resource cache
   - Allows proper garbage collection

2. **Monitor Memory Usage**
   ```
   Performance Overlay (F1):
   - Memory: Should stay under 1GB
   - Geometries: Should not continuously increase
   - Textures: Should remain stable
   ```

#### Memory Leak Prevention
```typescript
Best Practices:
├─ Avoid rapid page navigation
├─ Don't rapidly change between simulator tools
├─ Periodically refresh during long sessions
├─ Close simulator when not actively using
└─ Monitor resource stats in debug overlay
```

### Thermal Throttling

#### Symptoms
- Performance degrades after 10-15 minutes of use
- Laptop/device becomes hot
- Fan noise increases significantly

#### Solutions
1. **Improve Ventilation**
   - Elevate laptop for better airflow
   - Clean dust from computer vents
   - Use external cooling pad if available

2. **Reduce Processing Load**
   ```
   Thermal Management Settings:
   ├─ Graphics Quality: Low
   ├─ Target FPS: 30 instead of 60
   ├─ Background Apps: Close unnecessary programs
   ├─ Browser: Use hardware acceleration
   └─ Content: Avoid multiple simultaneous projections
   ```

---

## 3D Rendering Problems

### WebGL Context Loss

#### Symptoms
- Black screen in 3D areas
- Console error: "WebGL context lost"
- 3D content fails to load

#### Immediate Recovery
1. **Refresh Browser Tab**
   - Press `F5` or `Ctrl+R`
   - Wait for WebGL context to reinitialize

2. **Check WebGL Support**
   ```
   Browser Test:
   1. Visit: webglreport.com
   2. Verify WebGL 1.0 and 2.0 support
   3. Check for error messages
   ```

#### Prevention Strategies
```typescript
WebGL Stability:
├─ Update Graphics Drivers: Latest versions from manufacturer
├─ Browser Updates: Keep browser current
├─ Memory Management: Monitor GPU memory usage
├─ Stable Power: Ensure adequate power supply
└─ Clean Installation: Reinstall graphics drivers if needed
```

### Texture Loading Failures

#### Symptoms
- White or black textures instead of images
- Missing visual details on surfaces
- Console errors about texture loading

#### Diagnostic Steps
1. **Check Network Connection**
   ```
   Network Diagnostics:
   ├─ Open Developer Tools (F12)
   ├─ Go to Network tab
   ├─ Look for failed requests (red status)
   ├─ Note specific failed texture URLs
   └─ Test direct access to texture URLs
   ```

2. **Browser Cache Issues**
   - Clear browser cache: `Ctrl+Shift+Delete`
   - Disable cache in dev tools for testing
   - Try incognito/private browsing mode

#### Format Compatibility
```typescript
Supported Texture Formats:
├─ JPEG: Universal support, good for photos
├─ PNG: Transparency support, larger files
├─ WebP: Modern format, not universally supported
├─ Compressed: DXT, ETC formats for optimization
└─ Problematic: TIFF, PSD, proprietary formats
```

### Geometry Rendering Issues

#### Symptoms
- Objects appear wireframe instead of solid
- Missing or corrupted 3D models
- Geometry appears inside-out

#### Solutions
1. **Check Model Integrity**
   ```
   Model Validation:
   ├─ File Format: Ensure GLB/GLTF compatibility
   ├─ Polygon Count: Verify reasonable complexity
   ├─ UV Mapping: Check texture coordinate validity
   ├─ Normal Vectors: Ensure proper face orientation
   └─ Materials: Verify material assignments
   ```

2. **Rendering Mode Adjustments**
   - Enable wireframe mode to debug geometry
   - Check backface culling settings
   - Verify vertex normals calculation

### Shader Compilation Errors

#### Symptoms
- Pink/magenta materials instead of intended appearance
- Console errors mentioning "shader compilation"
- Missing visual effects

#### Debugging Process
1. **Open Browser Console** (`F12`)
2. **Look for Shader Errors**
   ```
   Common Error Patterns:
   ├─ "Failed to compile vertex shader"
   ├─ "Failed to compile fragment shader"
   ├─ "Cannot link program"
   └─ "Precision qualifier missing"
   ```

3. **GPU Compatibility Check**
   ```
   GPU Requirements:
   ├─ OpenGL ES 3.0+ support
   ├─ Sufficient shader ALU instructions
   ├─ Adequate texture units
   └─ Proper precision qualifier support
   ```

---

## Projection Simulator Issues

### Surface Creation Problems

#### Symptoms
- Cannot place surfaces in 3D scene
- Surfaces appear in wrong locations
- Properties panel doesn't update

#### Solutions
1. **Tool Selection Verification**
   ```
   Tool State Check:
   ├─ Ensure surface creation tool is active
   ├─ Check cursor changes when over viewport
   ├─ Verify no other tools are locked active
   └─ Reset tools with Escape key if needed
   ```

2. **Viewport Navigation Issues**
   - Reset camera position with Space key
   - Ensure camera isn't clipped into geometry
   - Adjust camera near/far clipping planes

### Projector Configuration Problems

#### Symptoms
- Projector beams don't appear
- Cannot adjust projector settings
- Projection doesn't align with surface

#### Diagnostic Steps
1. **Projector Visibility Check**
   ```
   Projector Debugging:
   ├─ Verify projector object is selected
   ├─ Check beam visualization is enabled
   ├─ Ensure projector is facing correct direction
   ├─ Validate target surface assignment
   └─ Test with simple content first
   ```

2. **Geometric Alignment**
   - Use grid references for positioning
   - Check throw distance calculations
   - Verify surface normal orientation
   - Test keystone correction functionality

### Content Loading Issues

#### Symptoms
- Content library appears empty
- Uploaded content doesn't appear
- Content fails to apply to projectors

#### Resolution Steps
1. **Content Library Refresh**
   ```
   Library Troubleshooting:
   ├─ Refresh browser tab
   ├─ Clear browser cache
   ├─ Check network connectivity
   ├─ Verify content server status
   └─ Try different content categories
   ```

2. **Upload Validation**
   ```typescript
   File Upload Requirements:
   ├─ Size Limit: Maximum 100MB per file
   ├─ Format: MP4, WebM, JPG, PNG, WebP
   ├─ Resolution: Maximum 4K (3840×2160)
   ├─ Codec: H.264/H.265 for video files
   └─ Duration: Maximum 10 minutes for video
   ```

### Export and Save Problems

#### Symptoms
- Cannot save project files
- Export function doesn't work
- Files save but are corrupted

#### Solutions
1. **Browser Permissions**
   - Enable download permissions for the site
   - Check popup blocker settings
   - Verify adequate disk space

2. **File Format Issues**
   ```
   Export Troubleshooting:
   ├─ Try different export formats
   ├─ Reduce project complexity
   ├─ Check console for error messages
   ├─ Verify all content is properly loaded
   └─ Test with simple project first
   ```

---

## Game-Related Problems

### VJ Career Game Loading Issues

#### Symptoms
- Game doesn't start when clicked
- Loading screen hangs indefinitely
- Character creation fails

#### Solutions
1. **Initial Setup Verification**
   ```
   Game Initialization:
   ├─ Clear browser local storage
   ├─ Ensure WebGL is working
   ├─ Check audio permissions
   ├─ Verify game data download
   └─ Try guest/demo mode first
   ```

2. **Progressive Loading**
   - Allow extra time for first load
   - Monitor network tab for asset loading
   - Check for ad blockers interfering
   - Try different browser if issues persist

### Performance and Career Progress Issues

#### Symptoms
- XP/money not saving between sessions
- Performance scores seem incorrect
- Achievements not unlocking

#### Diagnostic Steps
1. **Local Storage Check**
   ```
   Storage Verification:
   ├─ Browser Settings → Privacy → Site Data
   ├─ Verify LightBrush has storage permissions
   ├─ Check available storage quota
   ├─ Clear and restart if corrupted
   └─ Disable private/incognito mode
   ```

2. **Game Logic Validation**
   - Complete tutorial to ensure proper initialization
   - Verify network connectivity for cloud saves
   - Check console for JavaScript errors
   - Try manual save/load functions

### Audio and Music Problems

#### Symptoms
- No audio in game environments
- Music cuts out during gameplay
- Audio sync issues with visual content

#### Solutions
1. **Browser Audio Permissions**
   ```
   Audio Troubleshooting:
   ├─ Check browser audio permissions
   ├─ Unmute browser tab if muted
   ├─ Verify system audio levels
   ├─ Test with other web audio content
   └─ Restart browser if needed
   ```

2. **Audio Format Compatibility**
   - Modern browsers support WebAudio API
   - Check for codec compatibility issues
   - Verify network bandwidth for streaming audio
   - Try different audio quality settings

---

## Browser and Compatibility Issues

### Browser-Specific Problems

#### Chrome Issues
```typescript
Chrome Troubleshooting:
├─ Hardware Acceleration: chrome://settings → Advanced → System
├─ Flags: chrome://flags → Enable useful WebGL flags
├─ GPU Process: chrome://gpu → Check for errors
├─ Memory: chrome://memory-internals → Monitor usage
└─ Extensions: Disable all extensions temporarily
```

#### Firefox Issues
```typescript
Firefox Troubleshooting:
├─ WebGL: about:config → webgl.force-enabled = true
├─ Hardware Acceleration: Preferences → Performance
├─ Content Blocking: Disable strict privacy settings
├─ Add-ons: Test in safe mode (Help → Restart)
└─ Graphics: about:support → Check graphics info
```

#### Safari Issues
```typescript
Safari Troubleshooting:
├─ WebGL: Develop → Experimental Features
├─ WebRTC: Ensure modern Safari version
├─ Privacy: Disable "Prevent cross-site tracking"
├─ Cache: Develop → Empty Caches
└─ JavaScript: Ensure JavaScript is enabled
```

### Mobile Browser Issues

#### iOS Safari
- Enable JavaScript in Settings → Safari
- Disable Low Power Mode for better performance
- Clear Safari cache regularly
- Use landscape orientation for complex 3D content

#### Android Chrome
```typescript
Android Optimization:
├─ Enable "Desktop site" for full features
├─ Clear Chrome data if performance degrades
├─ Disable "Data Saver" mode
├─ Enable hardware acceleration in Chrome flags
└─ Close background apps to free memory
```

### Compatibility Mode Solutions

#### WebGL Fallback
```typescript
Legacy Support:
├─ WebGL 1.0: Basic functionality for older hardware
├─ Canvas 2D: Limited fallback for very old systems
├─ Static Mode: Non-interactive version for debugging
├─ Progressive Enhancement: Feature detection and graceful degradation
└─ Compatibility Warnings: Clear guidance for unsupported features
```

---

## Audio and Visual Issues

### Display and Color Problems

#### Symptoms
- Colors appear washed out or oversaturated
- Text is blurry or hard to read
- Interface elements are too small/large

#### Solutions
1. **Display Calibration**
   ```
   Display Settings:
   ├─ Monitor: Adjust brightness/contrast
   ├─ Color Profile: Use sRGB color space
   ├─ Resolution: Use native display resolution
   ├─ Zoom: Browser zoom at 100%
   └─ HDR: Disable HDR if causing issues
   ```

2. **Accessibility Adjustments**
   - Enable high contrast mode if needed
   - Adjust text size in browser settings
   - Use browser zoom for better readability
   - Check for vision accessibility features

### Audio Synchronization Issues

#### Symptoms
- Audio delayed compared to visuals
- Music doesn't match on-screen action
- Echo or audio feedback

#### Solutions
1. **Audio Latency Compensation**
   ```
   Audio Settings:
   ├─ Disable other audio applications
   ├─ Use wired headphones instead of Bluetooth
   ├─ Adjust system audio buffer size
   ├─ Close audio-heavy browser tabs
   └─ Check for Windows audio enhancements
   ```

2. **System Audio Configuration**
   - Set audio sample rate to 48kHz
   - Disable exclusive mode for audio devices
   - Update audio drivers if available
   - Test with different audio output devices

---

## Network and Loading Problems

### Slow Loading Times

#### Symptoms
- Long wait times for content to appear
- Textures loading gradually
- Intermittent connection errors

#### Network Optimization
1. **Connection Speed Test**
   ```
   Network Diagnostics:
   ├─ Test Speed: Use speedtest.net or similar
   ├─ Latency: Ping test to content servers
   ├─ Stability: Monitor for packet loss
   ├─ DNS: Try alternative DNS servers (8.8.8.8)
   └─ Router: Restart if connection unstable
   ```

2. **Bandwidth Management**
   - Pause other downloads/streams
   - Close unnecessary browser tabs
   - Disable automatic cloud backups
   - Use wired connection if possible

### Content Delivery Network (CDN) Issues

#### Symptoms
- Assets fail to load from specific regions
- Inconsistent loading performance
- Geographic-related access problems

#### Solutions
1. **CDN Troubleshooting**
   ```
   CDN Testing:
   ├─ Try VPN to different region
   ├─ Check CDN status pages
   ├─ Test with different DNS servers
   ├─ Clear browser DNS cache
   └─ Report persistent regional issues
   ```

2. **Alternative Loading Methods**
   - Enable "Offline Mode" if available
   - Use local content when possible
   - Report CDN issues to support
   - Try different times of day for better performance

---

## Frequently Asked Questions

### General Usage

#### Q: Why is the 3D content not loading?
**A:** Most commonly this is due to:
1. **WebGL not supported** - Update your browser and graphics drivers
2. **Insufficient hardware** - Try reducing quality settings
3. **Browser compatibility** - Use Chrome or Firefox for best results
4. **Network issues** - Check your internet connection

#### Q: Can I use this on mobile devices?
**A:** Yes, but with limitations:
- **Performance**: Reduced quality on mobile devices
- **Features**: Some advanced features only available on desktop
- **Controls**: Touch controls available but mouse/keyboard optimal
- **Browser**: Use latest Chrome or Safari for best mobile experience

#### Q: How do I improve performance on older computers?
**A:** Try these optimization steps:
1. Set graphics quality to "Low" or "Potato" mode
2. Disable particle effects and animations
3. Close other applications and browser tabs
4. Update graphics drivers and browser
5. Use a wired internet connection

### Technical Issues

#### Q: The projector beam isn't visible in the simulator
**A:** Check these settings:
1. Ensure the projector is selected and active
2. Verify beam visualization is enabled in view options
3. Check that projector is pointing toward a surface
4. Adjust camera position to see the projection area
5. Increase projector brightness if beam is too faint

#### Q: My uploaded content doesn't appear in the library
**A:** Verify these requirements:
1. **File format**: MP4, WebM, JPG, PNG, or WebP
2. **File size**: Under 100MB per file
3. **Resolution**: Maximum 4K (3840×2160)
4. **Duration**: Maximum 10 minutes for video
5. **Network**: Stable connection during upload

#### Q: Game progress isn't saving between sessions
**A:** This usually indicates:
1. **Browser storage disabled** - Enable local storage for the site
2. **Private browsing** - Use normal browser mode for save functionality
3. **Storage full** - Clear browser data to free space
4. **Cache issues** - Clear browser cache and restart

### Advanced Features

#### Q: How do I create complex multi-projector setups?
**A:** Follow this workflow:
1. Plan your layout in the 3D environment first
2. Add projectors one at a time, testing each
3. Use edge blending tools for overlap zones
4. Calibrate colors between projectors
5. Test with simple content before complex media

#### Q: Can I import my own 3D models?
**A:** Yes, with these specifications:
- **Format**: GLB or GLTF preferred
- **Polygon count**: Under 100,000 triangles for performance
- **Textures**: Embedded or external with supported formats
- **Scale**: Use real-world measurements for accuracy

#### Q: How do I optimize for real-world deployment?
**A:** Consider these factors:
1. **Measurements**: Use accurate real-world dimensions
2. **Ambient light**: Account for environment lighting
3. **Content**: Create content at projector native resolution
4. **Testing**: Verify setup with actual equipment when possible
5. **Documentation**: Export technical specifications for setup crew

### Troubleshooting Specific Error Messages

#### "WebGL context lost" or "WebGL not supported"
1. Update graphics drivers from manufacturer website
2. Enable hardware acceleration in browser settings
3. Try a different browser (Chrome recommended)
4. Check that graphics card supports OpenGL 3.0+

#### "Failed to load resource" or network errors
1. Check internet connection stability
2. Disable ad blockers and browser extensions
3. Clear browser cache and cookies
4. Try incognito/private browsing mode

#### "Out of memory" or performance warnings
1. Close other applications and browser tabs
2. Reduce graphics quality settings
3. Refresh the page to clear memory leaks
4. Restart browser if problem persists

### Getting Additional Help

If you continue experiencing issues after following this troubleshooting guide:

1. **Check Browser Console** (F12) for specific error messages
2. **Performance Overlay** (F1) to monitor system resources
3. **System Information**: Note browser version, OS, and graphics card
4. **Screenshots**: Capture any error messages or unexpected behavior
5. **Network Information**: Note connection speed and stability

### Reporting Bugs

When reporting issues, please include:
- **Browser and version** (e.g., Chrome 91.0.4472.124)
- **Operating system** (e.g., Windows 10, macOS 11.4)
- **Graphics card** and driver version
- **Specific steps** that cause the issue
- **Error messages** from browser console
- **Screenshots** or screen recordings if applicable

This troubleshooting guide covers the most common issues users encounter. For additional support or complex technical issues, please refer to the community forums or contact technical support with the diagnostic information listed above.