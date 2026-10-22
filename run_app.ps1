$SourcePath = $PSScriptRoot
$TempPath = "$env:TEMP\girupa_mern_runtime"

Write-Host "Creating clean runtime directory at $TempPath"
if (Test-Path $TempPath) {
    Remove-Item $TempPath -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $TempPath | Out-Null

Write-Host "Copying backend (excluding node_modules)..."
robocopy "$SourcePath\backend" "$TempPath\backend" /E /XD node_modules
Write-Host "Copying frontend (excluding node_modules)..."
robocopy "$SourcePath\frontend" "$TempPath\frontend" /E /XD node_modules

Write-Host "Installing Backend Dependencies..."
Set-Location "$TempPath\backend"
npm install express mongoose cors dotenv mongodb-memory-server --no-audit --no-fund --loglevel=error

Write-Host "Installing Frontend Dependencies..."
Set-Location "$TempPath\frontend"
npm install axios react react-dom react-router-dom --no-audit --no-fund --loglevel=error

Write-Host "Starting Backend..."
Start-Process node "server.js" -WorkingDirectory "$TempPath\backend" -WindowStyle Hidden

Write-Host "Starting Frontend..."
Start-Process npm "run dev" -WorkingDirectory "$TempPath\frontend" -WindowStyle Hidden

Write-Host "App is running from $TempPath"
