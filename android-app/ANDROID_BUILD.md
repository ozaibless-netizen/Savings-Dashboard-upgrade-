# 📱 Android App Build Guide

## Overview

This is a **React Native** Android app that:
- ✅ Listens for SMS automatically (no Tasker/Macrodroid needed)
- ✅ Runs as background service 24/7
- ✅ Detects SSID/WiFi networks
- ✅ Syncs offline when network is unavailable
- ✅ Shows notifications for savings approvals
- ✅ Connects to your Savings Dashboard backend

## Prerequisites

### System Requirements
- **Node.js** >= 16.x
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** (API level 30+)
- **Android Studio** (recommended)
- **Gradle** 7.x+

### Installation

1. **Install Node.js**
   ```bash
   # Download from https://nodejs.org
   node --version  # Should be >= 16
   ```

2. **Install Android SDK**
   ```bash
   # Install Android Studio from https://developer.android.com/studio
   # During setup, install:
   # - Android SDK Platform API 30+
   # - Android SDK Build-Tools
   # - Android SDK Platform-Tools
   # - Android SDK Tools
   ```

3. **Set Android Home Environment Variable**
   ```bash
   # Linux/Mac
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Add to ~/.bashrc or ~/.zshrc for persistence
   ```

   ```cmd
   # Windows (set in System Properties)
   ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

## Setup

### Step 1: Install Dependencies

```bash
cd android-app
npm install
```

### Step 2: Create `.env` File

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=https://your-app.onrender.com
REACT_APP_APP_VERSION=1.0.0
```

### Step 3: Build Gradle

```bash
cd android
./gradlew build
cd ..
```

## Development

### Run on Emulator

```bash
# Start React Native dev server
npm start

# In another terminal, run on Android
npm run android
```

### Run on Physical Device

1. **Enable USB Debugging**
   - Go to Settings → About phone
   - Tap "Build number" 7 times
   - Go back to Settings → Developer options
   - Enable "USB Debugging"

2. **Connect Device**
   ```bash
   adb devices  # Should list your device
   npm run android
   ```

### Debug with Logcat

```bash
adb logcat | grep SavingsDashboard
```

## Build for Release

### Generate APK (for testing)

```bash
npm run build-apk

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Generate AAB (for Google Play Store)

```bash
npm run build-aab

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Permissions Required

The app requires these permissions (automatically requested):

```xml
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

## Features Implemented

### ✅ SMS Detection
- Listens for incoming SMS automatically
- Parses Airtel, TNM, Vodacom, Betpawa messages
- Extracts amount, sender, type

### ✅ Real-time Sync
- Sends SMS data to server immediately
- Shows notifications for auto-approved savings
- No Tasker/Macrodroid needed

### ✅ Offline Support
- Queues SMS if offline
- Retries when network returns
- Background sync every 15 minutes

### ✅ SSID Detection
- Detects which WiFi network you're connected to
- Can configure per-network settings
- Supports WiFi-only mode

### ✅ Background Service
- Runs 24/7 even when app is closed
- Smart battery management
- Scheduled sync jobs

### ✅ Notifications
- Push notifications for savings approvals
- Status updates for offline queue
- Error alerts

## Publishing to Google Play Store

### Step 1: Create Developer Account
- Go to [Google Play Console](https://play.google.com/console)
- Sign in with Google account
- Pay $25 developer fee
- Create new app project

### Step 2: Setup Signing

```bash
# Generate keystore (do this once)
keytool -genkey -v -keystore ~/savings-dashboard.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias savingsdashboard

# Answer prompts:
# - First/Last Name: Your Name
# - Organizational Unit: Company
# - Organization: Company
# - City/Locality: City
# - State/Province: State
# - Country Code: Country (e.g., MW)
# - Password: [secure password]
```

### Step 3: Configure Signing in Gradle

Edit `android/app/build.gradle`:

```gradle
signingConfigs {
  release {
    if (project.hasProperty('KEYSTORE_PATH')) {
      storeFile file(KEYSTORE_PATH)
      storePassword KEYSTORE_PASSWORD
      keyAlias KEYSTORE_KEY_ALIAS
      keyPassword KEYSTORE_KEY_PASSWORD
    }
  }
}

buildTypes {
  release {
    signingConfig signingConfigs.release
  }
}
```

### Step 4: Build Release AAB

```bash
cd android
./gradlew bundleRelease \
  -PKEYSTORE_PATH=/path/to/savings-dashboard.keystore \
  -PKEYSTORE_PASSWORD=your_keystore_password \
  -PKEYSTORE_KEY_ALIAS=savingsdashboard \
  -PKEYSTORE_KEY_PASSWORD=your_key_password
cd ..
```

### Step 5: Upload to Play Store

1. Go to Google Play Console → Your App
2. Go to Release → Production
3. Create new release
4. Upload `app-release.aab` from `android/app/build/outputs/bundle/release/`
5. Add screenshots, description, privacy policy
6. Submit for review

## Troubleshooting

### "ANDROID_HOME not set"
```bash
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
# Or set in Windows System Properties
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew build
cd ..
```

### "App crashes on startup"
- Check logcat: `adb logcat | grep SavingsDashboard`
- Check permissions are granted
- Verify API key and webhook URL in .env

### "SMS not being received"
- Check SMS permission is granted
- Verify app is in background
- Check device battery optimization isn't killing app
- Restart device

### "Can't detect SSID"
- Grant location permission (required for WiFi scanning)
- Device must have location services enabled
- Some ROMs restrict SSID detection

## Development Tips

### Hot Reload
```bash
npm start
# Press 'r' to reload, 'd' to open debugger
```

### Metro Bundler Issues
```bash
# Clear cache
rm -rf /tmp/metro-cache
rm -rf node_modules/.cache
```

### Increase Debug Logging
Edit `src/App.js` and set:
```javascript
LogBox.ignoreAllLogs(); // or specific warnings
```

## Production Checklist

- [ ] API URL points to production Render server
- [ ] All permissions are necessary
- [ ] App version bumped
- [ ] Privacy policy written
- [ ] App icon created (192x192, 512x512)
- [ ] Screenshots taken (6-8 images)
- [ ] Description written for Play Store
- [ ] Signed APK generated
- [ ] Tested on multiple Android versions (API 30+)
- [ ] Tested SMS parsing with real messages
- [ ] Tested offline/online switching
- [ ] Tested background service

## Support

For issues:
1. Check Android Studio logcat
2. Run `adb logcat` in terminal
3. Check GitHub Issues
4. Contact dev team

---

**Ready to build? Run: `npm run build-aab` then upload to Play Store!**
