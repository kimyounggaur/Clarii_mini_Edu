@echo off
chcp 65001 >nul
rem ── 클라리 운지 마스터 로컬 빌드 ─────────────────────────────────
rem 이 머신의 Node 25는 한글 경로 + cmd 조상 프로세스에서 vite 빌드가
rem 0xC0000409로 죽으므로, PowerShell을 경유해 vite를 직접 실행하고
rem 임시 ASCII 경로의 산출물을 dist로 복사한다.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Set-Location -LiteralPath '%~dp0'; " ^
  "node node_modules\typescript\bin\tsc -b; if (-not $?) { exit 1 }; " ^
  "node node_modules\vite\bin\vite.js build; if (-not $?) { exit 1 }; " ^
  "if (Test-Path dist) { Remove-Item -Recurse -Force dist }; " ^
  "Copy-Item -Recurse (Join-Path $env:TEMP 'clarii-master-dist') dist; " ^
  "Write-Host '빌드 완료 → dist\' -ForegroundColor Green"
pause
