# Usage:
#   .\dev.ps1           Start Vite (foreground, Ctrl+C to stop)
#   .\dev.ps1 stop      Stop Vite
#   .\dev.ps1 status    Check if Vite is running
#   .\dev.ps1 build     Install + type-check + build
#   .\dev.ps1 test      Type check
#   .\dev.ps1 preview   Preview production build
#   .\dev.ps1 help      Show this help

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'status', 'build', 'test', 'preview', 'help')]
    [string]$Command = 'start'
)

$root = $PSScriptRoot
$distDir = Join-Path $root 'dist'

function Show-Help {
    Write-Host @"
Usage: .\dev.ps1 [command]

Commands:
  start      Start Vite (foreground, Ctrl+C to stop)
  stop       Stop Vite
  status     Check if Vite is running
  build      npm install + type-check + production build
  test       TypeScript type check
  preview    Preview production
  help       Show this help
"@
}

function Test-Requirements {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: npm not found" -ForegroundColor Red
        exit 1
    }
    if (-not (Test-Path (Join-Path $root 'package.json'))) {
        Write-Host "ERROR: package.json not found" -ForegroundColor Red
        exit 1
    }
}

function Get-VitePid {
    $port = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($port) { return [int]$port.OwningProcess }
    return $null
}

function Stop-Vite {
    $vitePid = Get-VitePid
    if ($null -eq $vitePid) {
        Write-Host "  Vite not running" -ForegroundColor Gray
        return
    }
    Write-Host "  Killing Vite (PID $vitePid)..." -ForegroundColor Yellow

    # 尝试多种方式杀掉
    $killed = $false
    try {
        Stop-Process -Id $vitePid -Force -ErrorAction Stop
        $killed = $true
    } catch {
        try {
            cmd /c "taskkill /F /T /PID $vitePid" 2>&1 | Out-Null
            $killed = $true
        } catch {}
    }

    Start-Sleep -Seconds 1
    if (Get-VitePid) {
        Write-Host "  ERROR: Cannot kill PID $vitePid" -ForegroundColor Red
        Write-Host "  Open Task Manager -> Details -> find PID $vitePid -> End Task" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  [OK] Stopped" -ForegroundColor Green
}

function Invoke-Start {
    Test-Requirements
    Write-Host "=== Frontend (Vite) ===" -ForegroundColor Cyan

    # 端口被占 → 尝试自动杀，杀不掉就用 5174
    $usePort = 5173
    if (Get-VitePid) {
        Write-Host "  Port 5173 in use, trying to kill existing Vite..." -ForegroundColor Yellow
        try {
            $existingPid = Get-VitePid
            Stop-Process -Id $existingPid -Force -ErrorAction Stop
            Start-Sleep -Seconds 1
        } catch {
            try {
                $existingPid = Get-VitePid
                cmd /c "taskkill /F /T /PID $existingPid" 2>&1 | Out-Null
                Start-Sleep -Seconds 1
            } catch {}
        }
        if (Get-VitePid) {
            Write-Host "  [WARN] Cannot kill existing process, using port 5174 instead" -ForegroundColor Yellow
            $usePort = 5174
        } else {
            Write-Host "  [OK] Killed existing Vite" -ForegroundColor Green
        }
    }

    # node_modules
    if (-not (Test-Path (Join-Path $root 'node_modules'))) {
        Write-Host "  Installing packages..." -ForegroundColor Yellow
        Set-Location $root
        npm install
        if ($LASTEXITCODE -ne 0) { Write-Host "  npm install failed" -ForegroundColor Red; exit 1 }
    }

    # 前台启动（指定端口）
    Write-Host ""
    Write-Host "  Frontend: http://localhost:$usePort" -ForegroundColor White
    Write-Host "  API:      http://localhost:5000 (via Gateway)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    Set-Location $root
    npm run dev -- --port $usePort
}

function Invoke-Stop {
    Write-Host "=== Stop Vite ===" -ForegroundColor Cyan
    Stop-Vite
}

function Invoke-Status {
    Write-Host "=== Vite Status ===" -ForegroundColor Cyan
    $vitePid = Get-VitePid
    if ($vitePid) {
        Write-Host "  Running: PID $vitePid" -ForegroundColor Green
        Write-Host "  URL:    http://localhost:5173" -ForegroundColor White
    } else {
        Write-Host "  Not running" -ForegroundColor Yellow
    }
}

function Invoke-Build {
    Write-Host "=== Build ===" -ForegroundColor Cyan
    Test-Requirements
    Set-Location $root
    if (Test-Path (Join-Path $root 'package-lock.json')) { npm ci } else { npm install }
    if ($LASTEXITCODE -ne 0) { exit 1 }
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { exit 1 }
    npm run build
    if ($LASTEXITCODE -ne 0) { exit 1 }
    if (Test-Path $distDir) {
        $size = (Get-ChildItem $distDir -Recurse -File | Measure-Object Length -Sum).Sum / 1KB
        Write-Host "  [OK] dist\ (~$([math]::Round($size, 1)) KB)" -ForegroundColor Green
    }
}

function Invoke-Test {
    Write-Host "=== Test ===" -ForegroundColor Cyan
    Test-Requirements
    Set-Location $root
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host "  [OK]" -ForegroundColor Green
}

function Invoke-Preview {
    Write-Host "=== Preview ===" -ForegroundColor Cyan
    Test-Requirements
    Set-Location $root
    if (-not (Test-Path $distDir)) { npm run build }
    Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
    npm run preview
}

switch ($Command) {
    'start'    { Invoke-Start }
    'stop'     { Invoke-Stop }
    'status'   { Invoke-Status }
    'build'    { Invoke-Build }
    'test'     { Invoke-Test }
    'preview'  { Invoke-Preview }
    'help'     { Show-Help }
    default    { Show-Help }
}
