# TodoRN App - Android Permission Issue Resolution

## 🚨 **Current Issue**
- `DETECT_SCREEN_CAPTURE` permission error on Android
- "main" component not registered error
- App fails to start on Android emulator

## ✅ **Step-by-Step Solution**

### 1. **Create Development Build (Recommended)**
```bash
# Install development client
npx expo install expo-dev-client

# Create development build
npx expo run:android
```

### 2. **Alternative: Use iOS Simulator**
```bash
# Start on iOS (usually more stable)
npx expo start --ios
```

### 3. **Alternative: Use Web Development**
```bash
# Start on web for development
npx expo start --web
```

### 4. **Fix Android Emulator Issues**
```bash
# Kill existing emulator
adb devices
adb -s emulator-5556 emu kill

# Start fresh emulator with different API level
# Use API 33 or 34 instead of 36
```

### 5. **Update Expo SDK (If Needed)**
```bash
# Update to latest Expo SDK
npx expo install --fix
```

### 6. **Reset Project (Nuclear Option)**
```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

## 🔧 **Current Working Configuration**

### App.tsx (Minimal)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TodoRN App</Text>
      <Text style={styles.subtext}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
```

### app.json (Minimal)
```json
{
  "expo": {
    "name": "TodoRN",
    "slug": "TodoRN",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.todorn.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.todorn.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## 🎯 **Next Steps**

1. **Test the minimal version** on iOS/web first
2. **Gradually add features** once basic app works
3. **Use development build** for Android testing
4. **Consider different Android API level** if issues persist

## 📱 **Development Strategy**

### Phase 1: Basic App ✅
- Minimal App.tsx working
- No complex dependencies

### Phase 2: Add Redux
- Add Redux store
- Basic state management

### Phase 3: Add Navigation
- React Navigation
- Basic screens

### Phase 4: Add Features
- Database integration
- Authentication
- Full feature set

## 🚀 **Quick Test Commands**

```bash
# Test on iOS
npx expo start --ios

# Test on Web
npx expo start --web

# Test with development build
npx expo run:android

# Clear and restart
npx expo start --clear
``` 