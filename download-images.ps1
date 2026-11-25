# ==============================================================================
# NOIR BARBER — Local Image Asset Downloader
# Совместимо с Windows PowerShell 5.1 и PowerShell 7+
# ==============================================================================

# Принудительно включаем современные протоколы TLS 1.2 для Windows PowerShell 5.1
try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls
} catch {
    # Игнорируем, если среда уже использует более современную конфигурацию
}

$ErrorActionPreference = 'Continue'
$TargetDir = Join-Path -Path $PSScriptRoot -ChildPath 'assets\images'

# Проверяем и создаём целевую директорию assets/images/
if (-not (Test-Path -LiteralPath $TargetDir)) {
    try {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    } catch {
        Write-Host "[!] Не удалось создать папку $TargetDir : $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "NOIR BARBER — Загрузка реальных фотографий Unsplash" -ForegroundColor Cyan
Write-Host "Каталог назначения: $TargetDir" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan

# Словарь файлов и URL (все строки заключены в одинарные кавычки во избежание парсинга символов &)
$images = [ordered]@{
    'hero-portrait.jpg'   = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&h=1440&q=85'
    'about-interior.jpg'  = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=960&h=1200&q=85'
    'about-craft.jpg'     = 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=960&h=720&q=85'
    'services-craft.jpg'  = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=960&h=1200&q=85'
    'master-volkov.jpg'   = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&h=1125&q=85'
    'master-orlov.jpg'    = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=840&h=1050&q=85'
    'master-smirnov.jpg'  = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=840&h=1120&q=85'
    'contacts-facade.jpg' = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=960&h=1200&q=85'
}

$successCount = 0
$failedItems = @()

foreach ($key in $images.Keys) {
    $url = $images[$key]
    $destFile = Join-Path -Path $TargetDir -ChildPath $key
    $tempFile = Join-Path -Path $TargetDir -ChildPath ($key + '.download.tmp')

    Write-Host "-> Загрузка: $key..." -ForegroundColor Yellow

    # Удаляем временный файл, если он остался от предыдущего прерванного запуска
    if (Test-Path -LiteralPath $tempFile) {
        Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
    }

    $downloadOk = $false
    try {
        # Invoke-WebRequest с обязательным параметром -UseBasicParsing для Windows PowerShell 5.1
        Invoke-WebRequest -Uri $url -OutFile $tempFile -UseBasicParsing -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NOIR-Downloader/1.0' -TimeoutSec 30
        $downloadOk = $true
    } catch {
        Write-Host "   [!] Сбой сети при загрузке ${key}: $($_.Exception.Message)" -ForegroundColor Red
    }

    if (-not $downloadOk -or -not (Test-Path -LiteralPath $tempFile)) {
        $failedItems += [PSCustomObject]@{
            Name   = $key
            Url    = $url
            Reason = 'Сетевая ошибка или тайм-аут'
        }
        continue
    }

    # Проверка целостности файла: размер и сигнатура растрового изображения (JPEG, PNG или WebP)
    $isValidImage = $false
    try {
        $bytes = [System.IO.File]::ReadAllBytes($tempFile)
        $len = $bytes.Length

        if ($len -ge 4) {
            # Сигнатура JPEG: FF D8 FF
            $isJpeg = ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF)
            # Сигнатура PNG: 89 50 4E 47
            $isPng  = ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47)
            # Сигнатура WebP / RIFF
            $isWebP = ($len -ge 12 -and $bytes[0] -eq 0x52 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46 -and $bytes[3] -eq 0x46)

            # Файл должен иметь сигнатуру изображения и размер не менее 8 КБ (исключает HTML-ошибки)
            if (($isJpeg -or $isPng -or $isWebP) -and $len -gt 8192) {
                $isValidImage = $true
            }
        }
    } catch {
        $isValidImage = $false
    }

    if ($isValidImage) {
        try {
            # Атомарная замена целевого файла
            Move-Item -LiteralPath $tempFile -Destination $destFile -Force
            $sizeKb = [math]::Round((Get-Item -LiteralPath $destFile).Length / 1KB)
            Write-Host "   [OK] Успешно сохранено: $key ($sizeKb KB)" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "   [!] Ошибка перезаписи файла ${key}: $_" -ForegroundColor Red
            $failedItems += [PSCustomObject]@{
                Name   = $key
                Url    = $url
                Reason = "Не удалось сохранить файл: $_"
            }
            Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
        }
    } else {
        # Получен поврежденный файл или текстовая HTML-страница ошибки
        Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
        Write-Host "   [!] Ошибка: получен невалидный файл (HTML-страница ошибки или повреждённый ответ)." -ForegroundColor Red
        $failedItems += [PSCustomObject]@{
            Name   = $key
            Url    = $url
            Reason = 'Файл не является изображением (HTML/403/Cloudflare)'
        }
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
if ($failedItems.Count -eq 0) {
    Write-Host "Готово! Все $successCount фотографий успешно скачаны и проверены." -ForegroundColor Green
    Write-Host "Все файлы сохранены в папку assets/images/" -ForegroundColor Green
} else {
    Write-Host "Загрузка завершена с ошибками." -ForegroundColor Yellow
    Write-Host "Успешно: $successCount из $($images.Count)." -ForegroundColor Yellow
    Write-Host "Не удалось загрузить ($($failedItems.Count)):" -ForegroundColor Red
    foreach ($f in $failedItems) {
        Write-Host " - $($f.Name): $($f.Reason)" -ForegroundColor Red
        Write-Host "   Прямой URL: $($f.Url)" -ForegroundColor DarkGray
    }
    Write-Host "`nДля нескачанных файлов сохранились текущие локальные изображения." -ForegroundColor Yellow
}
Write-Host "============================================================" -ForegroundColor Cyan
