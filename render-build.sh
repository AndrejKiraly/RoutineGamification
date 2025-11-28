#!/bin/bash

echo "🔧 Starting Render build process..."

# Check if environment variables are set
if [ -z "$FIREBASE_API_KEY" ]; then
  echo "⚠️  Warning: FIREBASE_API_KEY not set. Firebase will not work."
  echo "ℹ️  App will still work with LocalStorage only."
else
  echo "✅ Firebase environment variables detected"

  # Replace placeholders in firebase-config.js with actual environment variables
  echo "🔄 Configuring Firebase..."

  sed -i "s|%%FIREBASE_API_KEY%%|${FIREBASE_API_KEY}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_AUTH_DOMAIN%%|${FIREBASE_AUTH_DOMAIN}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_PROJECT_ID%%|${FIREBASE_PROJECT_ID}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_STORAGE_BUCKET%%|${FIREBASE_STORAGE_BUCKET}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_MESSAGING_SENDER_ID%%|${FIREBASE_MESSAGING_SENDER_ID}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_APP_ID%%|${FIREBASE_APP_ID}|g" js/config/firebase-config.js
  sed -i "s|%%FIREBASE_MEASUREMENT_ID%%|${FIREBASE_MEASUREMENT_ID}|g" js/config/firebase-config.js

  echo "✅ Firebase configuration complete"
fi

echo "✅ Build process completed successfully!"
