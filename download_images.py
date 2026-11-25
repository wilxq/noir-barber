"""NOIR BARBER — Local Image Asset Downloader
Скрипт для быстрой локальной загрузки 8 отобранных реальных фотографий с Unsplash
напрямую в папку assets/images/ без ручного сохранения через браузер.

Лицензия: Unsplash License (свободное коммерческое использование без обязательного указания автора).
Запуск: python download_images.py
"""

import os
import urllib.request

IMAGE_SOURCES = {
    "hero-portrait.jpg": {
        "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&h=1440&q=85",
        "author": "Albert Dera (@albertdera)",
        "desc": "Стильный мужской портрет с аккуратной стрижкой и студийным светом (3:4)",
    },
    "about-interior.jpg": {
        "url": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=960&h=1200&q=85",
        "author": "Guilherme Petri (@gpetri)",
        "desc": "Интерьер премиального барбершопа: кресла, зеркала, тёмный камень и дерево (4:5)",
    },
    "about-craft.jpg": {
        "url": "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=960&h=720&q=85",
        "author": "Arthur Edelman (@arthuredelman)",
        "desc": "Предметный натюрморт профессиональных ножниц и опасной бритвы на сланце (4:3)",
    },
    "services-craft.jpg": {
        "url": "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=960&h=1200&q=85",
        "author": "Hai Phung (@haiphung)",
        "desc": "Крупный план работы барбера ножницами (scissor-over-comb) (4:5)",
    },
    "master-volkov.jpg": {
        "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&h=1125&q=85",
        "author": "Joseph Gonzalez (@joegonzalez)",
        "desc": "Портрет мастера Александра Волкова (Senior Barber) (4:5)",
    },
    "master-orlov.jpg": {
        "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=840&h=1050&q=85",
        "author": "Jurica Koletic (@juricakoletic)",
        "desc": "Портрет мастера Михаила Орлова (Barber, текстура и fade) (4:5)",
    },
    "master-smirnov.jpg": {
        "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=840&h=1120&q=85",
        "author": "Craig McKay (@craigmckay)",
        "desc": "Портрет мастера Даниила Смирнова (Barber, борода и бритьё) (3:4)",
    },
    "contacts-facade.jpg": {
        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=960&h=1200&q=85",
        "author": "Jens Behrmann (@jensbehrmann)",
        "desc": "Вечерний фасад и минималистичный вход с тёмным камнем и тёплым светом (4:5)",
    },
}

def main():
    target_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "images")
    os.makedirs(target_dir, exist_ok=True)
    
    print("=" * 60)
    print("NOIR BARBER — Загрузка реальных фотографий высокого качества")
    print("=" * 60)
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NOIR-Barber-Downloader/1.0"}
    success_count = 0

    for filename, meta in IMAGE_SOURCES.items():
        dest = os.path.join(target_dir, filename)
        print(f"\n-> Скачивание: {filename}")
        print(f"   Автор: {meta['author']}")
        print(f"   Назначение: {meta['desc']}")
        try:
            req = urllib.request.Request(meta["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp, open(dest, "wb") as out:
                out.write(resp.read())
            size_kb = os.path.getsize(dest) // 1024
            print(f"   [OK] Успешно сохранено: {size_kb} KB")
            success_count += 1
        except Exception as e:
            print(f"   [!] Ошибка скачивания: {e}")
            print(f"   Ссылка для ручной загрузки в браузере: {meta['url']}")

    print("\n" + "=" * 60)
    print(f"Итог: успешно загружено {success_count} из {len(IMAGE_SOURCES)} изображений.")
    print("Все файлы сохранены в папку assets/images/ без необходимости правок в HTML/CSS.")
    print("=" * 60)

if __name__ == "__main__":
    main()
