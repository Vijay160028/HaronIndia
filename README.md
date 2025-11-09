# Farm Connect - Haron India

A React Native mobile application for agricultural services, connecting farmers with seeds, equipment, and produce trading.

## 🌱 Overview

Farm Connect is a comprehensive agricultural platform that enables farmers to:
- **Buy** seeds and agricultural inputs
- **Rent** farming equipment
- **Sell** their produce
- Track active listings and transactions

## 📱 Features

### Authentication
- **Phone Number Login** (Primary method)
  - OTP verification
  - Indian country code (+91) support
- **Email/Password Login** (Alternative method)
  - Direct access to dashboard

### Dashboard
- **Welcome Section** with personalized greeting
- **Weather Information** display
- **Action Cards** for main services:
  - 🛒 Seeds & Inputs
  - 🚜 Equipment Rental
  - 🏷️ Produce Selling
- **Active Listings** with progress tracking
- **Status Management** for ongoing transactions

### Design System
- **Green Theme** matching agricultural branding
- **Consistent Typography** and spacing
- **Responsive Design** for mobile devices
- **Professional UI/UX** with smooth animations

## 🛠️ Technology Stack

- **React Native** 0.81.4
- **React** 19.1.0
- **TypeScript** 5.8.3
- **React Navigation** 6.x
- **React Native Safe Area Context**
- **React Native Gesture Handler**
- **React Native Vector Icons**

## 📋 Prerequisites

- **Node.js** >= 20
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development)
- **Java Development Kit (JDK)**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HaronIndia
```

### 2. Install Dependencies
```bash
npm install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Android Setup
- Ensure Android Studio is installed
- Set up Android SDK
- Create an Android Virtual Device (AVD)

### 5. Run the Application

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

#### Start Metro Bundler
```bash
npm start
```

## 📁 Project Structure

```
HaronIndia/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.js       # Custom button component
│   │   ├── Input.js        # Form input component
│   │   └── Card.js         # Card container component
│   ├── screens/            # Application screens
│   │   ├── SplashScreen.js
│   │   ├── SignInScreen.js
│   │   ├── PhoneVerificationScreen.js
│   │   └── HomeScreen.js
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.js
│   ├── constants/          # App constants and theme
│   │   └── theme.js
│   └── assets/            # Images and icons
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
├── App.tsx               # Main application component
└── package.json          # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary Green**: #4CAF50
- **Primary Dark**: #388E3C
- **Primary Light**: #C8E6C9
- **Background**: #FFFFFF
- **Text**: #212121

### Typography
- **H1**: 32px, Bold
- **H2**: 24px, Bold
- **H3**: 20px, Semi-bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## 🔧 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 📱 Screens

### 1. Splash Screen
- Farm Connect logo
- Automatic navigation to phone verification

### 2. Phone Verification Screen
- Phone number input with country code
- OTP verification process
- Alternative email login option

### 3. Sign In Screen
- Phone number and password fields
- Alternative phone verification option

### 4. Home Screen
- Personalized welcome message
- Weather information
- Service action cards
- Active listings with progress tracking

## 🔐 Authentication Flow

### Primary Flow (Phone Login)
1. **Splash Screen** → **Phone Verification**
2. **Enter Phone Number** → **Send OTP**
3. **Enter OTP** → **Home Dashboard**

### Alternative Flow (Email Login)
1. **Phone Verification** → **"Sign in with Email"**
2. **Enter Email + Password** → **Home Dashboard**

## 🧪 Testing Credentials

For testing purposes, the following dummy credentials are available:

### Email/Password Login
- **Email:** `user@farmconnect.com` | **Password:** `password123`
- **Email:** `farmer@test.com` | **Password:** `test123`
- **Email:** `admin@demo.com` | **Password:** `admin123`

### Phone Number Login
- Any 10-digit phone number will work for OTP verification
- OTP: Any 4-digit number (for demo purposes)

> **Note:** These are dummy credentials for testing only. No actual authentication is performed.

## 🎯 Key Components

### Button Component
- Multiple variants (primary, secondary, outline)
- Different sizes (small, medium, large)
- Disabled states
- Custom styling support

### Input Component
- Label support
- Error handling
- Right icon support
- Focus states
- Validation

### Card Component
- Multiple variants
- Shadow effects
- Rounded corners
- Flexible content

## 🚀 Deployment

### Android
1. Generate signed APK
2. Upload to Google Play Store

### iOS
1. Archive the app in Xcode
2. Upload to App Store Connect

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Authentication system
  - Dashboard with action cards
  - Active listings management
  - Responsive design

---

**Farm Connect** - Connecting farmers with agricultural opportunities 🌾