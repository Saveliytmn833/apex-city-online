# APEX CITY ONLINE (mobile, 8 players)

## What is included
- Existing APEX CITY mobile HTML game as the client.
- Touch controls remain available on phones.
- Create a room or join by a 6-character code.
- Up to 8 players per room.
- Other players are rendered in the same world; on-foot / car position and heading are synchronized.
- Shareable room URL (`?room=CODE`).
- Node.js + WebSocket server; no paid SDK or game-service subscription.

## Run locally
Requires Node.js 18+. From this folder:

```bash
npm install
npm start
```

Open `http://localhost:2567` on the host device. To let phones on the same Wi-Fi join, open `http://YOUR_COMPUTER_LAN_IP:2567` on each phone. For friends outside the Wi-Fi network, deploy the Node server to a free Node-capable host or use a secure tunnel. A static-only host such as GitHub Pages cannot run the WebSocket server.

## Free hosting notes
The code has no paid-service dependency. A free host may sleep, impose traffic limits, or change its free tier. For an always-on public server, free availability is not guaranteed. Deploy the whole project (not only `public/index.html`) to a Node.js host and set its start command to `npm start`; the app uses the assigned `PORT`.

## Current prototype limits
This is an early multiplayer layer: player position and vehicle position/heading are relayed at 10 updates per second. It does not yet synchronize missions, money, police AI, traffic, inventory, or vehicle ownership. Movement is client-reported rather than authoritative, so it is not cheat-proof.
