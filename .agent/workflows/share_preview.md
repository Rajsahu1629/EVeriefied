---
description: Share the app with a remote friend using Expo Tunnel
---

To share your running app with someone remotely (e.g. 1000km away) for review, you can use the **Tunnel** feature of Expo. This exposes your local development server to the internet.

### Prerequisites
Both you and your friend need:
1.  **Expo Go** app installed on your phones (available on Play Store / App Store).

### Steps
1.  **Stop** your current server (Ctrl+C).
2.  Run the following command to start the tunnel:
    ```bash
    npx expo start --tunnel
    ```
3.  Wait for the QR code to appear.
4.  **Send the QR Code** (screenshot it) or the **URL** (starts with `exp://...`) to your friend.
    *   The URL will be shown in the terminal, e.g., `exp://u5-99s.anonymous.eve-erified.exp.direct:80`
5.  Your friend needs to:
    *   Open **Expo Go** on their Android phone.
    *   Tap "Scan QR Code" (if needed) or pasting the link might work depending on version.
    *   Usually, sending the link via WhatsApp/Telegram and clicking it while Expo Go is installed is the easiest way.

### Important Notes
- **Keep your terminal open**. If you close your laptop or stop the command, the app will stop working for your friend.
- The connection might be slower than your local wifi properly.
- If your friend is on iOS, they might need to log in to an Expo account, but Android usually allows anonymous usage.
