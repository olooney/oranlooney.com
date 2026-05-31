#!/bin/bash

# Setup playwright test server

export WIN_HOST="$(ip route show default | awk '{print $3}')"
echo "WIN_HOST=$WIN_HOST"
echo "Base URL: http://$WIN_HOST:8080"

npm install -D playwright
npx playwright install chromium
sudo env "PATH=$PATH" npx playwright install-deps chromium

echo "Setup complete. Run 'node scripts/check-mathjax.js' to test."
