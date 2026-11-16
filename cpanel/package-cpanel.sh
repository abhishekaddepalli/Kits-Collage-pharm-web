#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/cpanel-dist"

echo "1) Building static React/Vite frontend..."
cd "$ROOT_DIR"
npm run build

echo "2) Assembling cPanel split-directory release package in $OUT_DIR..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/application" "$OUT_DIR/public_html"

# Copy Laravel backend outside public_html
cp -R "$ROOT_DIR/backend/"* "$OUT_DIR/application/"
cp "$ROOT_DIR/backend/.env.example" "$OUT_DIR/application/.env.example"
mkdir -p "$OUT_DIR/application/storage/app/public/uploads" \
         "$OUT_DIR/application/storage/framework/cache" \
         "$OUT_DIR/application/storage/framework/sessions" \
         "$OUT_DIR/application/storage/framework/views" \
         "$OUT_DIR/application/storage/logs" \
         "$OUT_DIR/application/bootstrap/cache"

# Copy static React build + cPanel front controller & .htaccess into public_html
cp -R "$ROOT_DIR/dist/"* "$OUT_DIR/public_html/"
cp "$ROOT_DIR/cpanel/public_html/.htaccess" "$OUT_DIR/public_html/.htaccess"
cp "$ROOT_DIR/cpanel/public_html/index.php" "$OUT_DIR/public_html/index.php"

echo "3) Package ready:"
echo "   - Upload $OUT_DIR/application/ -> /home/CPANEL_USER/application/"
echo "   - Upload $OUT_DIR/public_html/ -> /home/CPANEL_USER/public_html/"
echo "   - Link storage: ln -s /home/CPANEL_USER/application/storage/app/public /home/CPANEL_USER/public_html/storage"
