# BudgetGuard - Uganda-Focused Personal Expense and Mobile Money Tracker

BudgetGuard is a privacy-first, offline-first Progressive Web App (PWA) designed to help Ugandan users track their daily expenses with special focus on Mobile Money (MTN MoMo and Airtel Money) transactions.

## Key Features

### Core Features
- Offline-First: All data lives on your device
- Privacy-First: Your financial data never leaves your device
- Multi-Currency: Primary support for UGX (Ugandan Shillings)
- Budget Envelopes: Organize spending into Budget Pots
- Savings Goals: Set targets and track progress

### Uganda-Specific Features
- MTN MoMo and Airtel Money Integration (SMS auto-import on Android)
- 13 Uganda-specific categories with subcategories
- Smart auto-categorization for common merchants
- Mobile Money Fee Tracking
- User-Configurable Seasonal Reminders

### Reports and Analytics
- Daily, Weekly, Monthly spending summaries
- Spending by category (pie charts)
- Spending trends (line graphs)
- Top recipients analysis
- Payment method breakdown

### Security and Privacy
- Biometric Lock (Android)
- PIN Security with auto-lock
- Privacy Mode to hide monetary values

## Quick Start

### For Android Users

#### Option 1: Download APK from GitHub (Recommended)
1. Go to: https://github.com/BrimstoneTech/BudgetGuard/releases
2. Download the latest budgetguard.apk file
3. Install the APK on your Android device
4. Open the app and follow the setup wizard

#### Option 2: Build from Source
npm install
npm run build
npm run android:build-apk

APK location: android/app/build/outputs/apk/debug/app-debug.apk

### For iOS/Web Users
Navigate to: https://brimstonetech.github.io/BudgetGuard
Tap Add to Home Screen to install as a PWA

## Installation

Prerequisites: Node.js 18+, npm, Android Studio, Java JDK 17+

git clone https://github.com/BrimstoneTech/BudgetGuard.git
cd BudgetGuard
npm install
npm run dev

## SMS Auto-Import (Android Only)

Required Permissions: READ_SMS, RECEIVE_SMS
Supported Providers: MTN Mobile Money, Airtel Money

## Usage

Complete the setup wizard to get started.

## Categories

13 Uganda-specific categories including Food and Drinks, Transport, Airtime and Data, Utilities, Rent and Housing, Family and Social, Health, Business, Savings and Investments, Personal Care, Entertainment, Mobile Money Fees.

## Technology

React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Framer Motion, Lucide React, Capacitor 8, IndexedDB

## Support

Email: isaiahtalemwa5@gmail.com

Made with pride in Uganda by BrimstoneTech
