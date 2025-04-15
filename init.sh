#!/bin/bash
echo "Initializing Research Gap Identifier project..."

echo "Installing dependencies..."
npm install

echo "Downloading PDF.js files..."
cd public/js
curl -o pdf.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js
curl -o pdf.worker.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js
cd ../..

echo "Setting up environment..."
cp .env.example .env
echo "Please update the .env file with your Gemini API key."

echo "Creating uploads directory..."
mkdir -p server/uploads

echo "Initialization complete!"
echo "To start the application in development mode, run: npm run dev" 