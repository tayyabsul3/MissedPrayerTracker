# Run Qaza Tracker Backend with proper path quoting
$pythonPath = "C:\Users\Tayyab Sultan\AppData\Local\Programs\Python\Python310\python.exe"

Write-Host "Starting Qaza Tracker FastAPI Server..." -ForegroundColor Green
& $pythonPath -m uvicorn app.main:app --reload --port 8000
