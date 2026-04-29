# Install and run backend
Write-Host "Starting FastAPI Backend..." -ForegroundColor Green
Set-Location -Path "backend"
if (-Not (Test-Path -Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
& .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 5001"

# Run frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Green
Set-Location -Path "..\next-client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd next-client; npm run dev"

Write-Host "Servers are starting in new windows. The frontend will be available at http://localhost:3000" -ForegroundColor Cyan
