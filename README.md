# Tempest Share - Global Clipboard

A peer-to-peer file sharing application that works as your temporary global clipboard. Files are sent directly between devices without storing them on any server.

## Features

- 🔒 **Secure P2P transfers** - Files go directly between devices
- 🌐 **No server storage** - Nothing is saved anywhere
- ⚡ **Real-time transfers** - Share files instantly with a simple code
- 📱 **Cross-platform** - Works on any device with a web browser

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

## How it Works

1. **Send**: Select a file and get a unique sharing code
2. **Receive**: Enter the code on another device to receive the file
3. Files are transferred directly between devices using WebRTC
