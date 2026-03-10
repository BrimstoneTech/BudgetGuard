<div align="center">
  <img width="200" src="public/logo.png" alt="BudgetGuard Logo" />
  <h1>BudgetGuard</h1>
  <p><strong>Premium Offline-First Financial Intelligence</strong></p>
</div>

## Overview

**BudgetGuard** is a highly secure, privacy-focused personal finance and budgeting application designed for Android. Built by TAISAN under BrimstoneTech, BudgetGuard ensures your financial data never leaves your device by utilizing a true offline-first architecture. 

## Key Features

- **True Offline Storage**: Relies completely on client-side `IndexedDB` storage, meaning absolutely zero data is sent to external servers. Your finances stay on your phone.
- **Biometric & PIN Security**: Protects your data with a custom 4-digit PIN and native hardware biometric fingerprint scanning.
- **Smart Voice Entry**: Quickly add transactions hands-free using the native Web Speech API.
- **Envelope Budgeting**: Organize your spending into distinct "Budget Pots" to effortlessly track limits.
- **Savings Goals & Tasks**: Setup dynamic savings targets with built-in habit-tracking tasks and progress notifications.
- **Dynamic Theming**: Choose between crisp Light mode, deep Dark mode, or our flagship highly stylized "Vibrant/Neon" theme.
- **Privacy Mode**: Instantly obscure all monetary values on your screen with a single tap for public use.

## Architecture & Tech Stack

- **Framework**: React + Vite + TypeScript
- **Styling**: TailwindCSS + Framer Motion (for fluid, gesture-based interactions)
- **Mobile Engine**: Capacitor (for native Android APIs, including Haptics, Status Bar, and Biometrics)
- **Data Persistence**: IndexedDB API

## Local Development

**Prerequisites:** Node.js (v18+)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Run the application in your local web browser:
   ```bash
   npm run dev
   ```

## Android Deployment

To compile the application into a standalone Android APK:

1. Ensure you have the **Android SDK** and **Java** installed on your system.
2. Run the automated build script:
   ```bash
   npm run android:build-apk
   ```
3. The newly generated APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---
*Created by TAISAN • © BrimstoneTech*
