#!/usr/bin/env bash

# Patch the service worker to immediately skip waiting to install
sw=`cat dist/service-worker.js`
echo "self.skipWaiting();$sw" > dist/service-worker.js
