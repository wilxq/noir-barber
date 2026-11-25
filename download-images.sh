#!/usr/bin/env bash
# NOIR BARBER — Local Image Asset Downloader (Bash / macOS / Linux)
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
TARGET="$DIR/assets/images"
mkdir -p "$TARGET"

echo "============================================================"
echo "NOIR BARBER — Загрузка реальных фотографий Unsplash"
echo "============================================================"

declare -A IMAGES=(
  ["hero-portrait.jpg"]="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&h=1440&q=85"
  ["about-interior.jpg"]="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=960&h=1200&q=85"
  ["about-craft.jpg"]="https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=960&h=720&q=85"
  ["services-craft.jpg"]="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=960&h=1200&q=85"
  ["master-volkov.jpg"]="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&h=1125&q=85"
  ["master-orlov.jpg"]="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=840&h=1050&q=85"
  ["master-smirnov.jpg"]="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=840&h=1120&q=85"
  ["contacts-facade.jpg"]="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=960&h=1200&q=85"
)

for file in "${!IMAGES[@]}"; do
  url="${IMAGES[$file]}"
  echo "-> Скачивание $file..."
  curl -sSL -A "Mozilla/5.0" "$url" -o "$TARGET/$file"
  echo "   [OK] $file обновлен."
done

echo "============================================================"
echo "Все 8 реальных фотографий успешно скачаны в assets/images/"
echo "============================================================"
