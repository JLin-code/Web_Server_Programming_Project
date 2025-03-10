#!/bin/bash

echo "Cleaning up npm cache and removing problematic files..."
cd client
rm -rf node_modules package-lock.json
npm cache clean --force

echo "Installing dependencies..."
npm install

echo "Building the client..."
npm run build
