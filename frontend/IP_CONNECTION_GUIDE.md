# Connecting to Yap Video Chat Using IP Address

## Overview

This guide explains how to connect to the Yap video chat application using your IP address (`10.104.202.21`), allowing other users on the same network to join your video calls.

## For the Host (You)

1. Start the application with the following command from the `frontend` directory:

   ```bash
   npm run dev
   ```

2. The server will now be accessible at: http://10.104.202.21:3000

3. Navigate to http://10.104.202.21:3000/video-call to start a video call

4. Share the room link with others by clicking the "Copy Room Link" button

## For Participants

1. Participants should open the link you shared with them, which will look something like:
   http://10.104.202.21:3000/video-call?room=<room-id>

2. They will automatically join your video call room

## Troubleshooting

- Make sure all participants are on the same network
- If connections fail, check that your network allows WebSocket connections
- Ensure your firewall isn't blocking connections on port 3000
- If the backend server is running separately, make sure it's also accessible (port 8080)