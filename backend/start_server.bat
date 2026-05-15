@echo off
:: ============================================================
:: start_server.bat
:: AI Health Assistant — One Click Server Startup
:: ============================================================

title AI Health Assistant — Backend Server

cd /d "%~dp0"
echo.
echo =======================================================
echo   AI Health Assistant — Backend Startup
echo =======================================================

:: ============================================================
:: STEP 1 — Activate virtual environment
:: ============================================================

echo.
echo [STEP 1] Activating virtual environment...

if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found.
    echo Please run: python -m venv venv
    echo Then run:   pip install -r requirements.txt
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
echo [OK] Virtual environment activated.

:: ============================================================
:: STEP 2 — Check if model files exist
:: ============================================================

echo.
echo [STEP 2] Checking model files...

if not exist "ml_models\disease_model.pkl" (
    echo [INFO] Model files not found. Training now...
    echo [INFO] This only happens once. Please wait...
    echo.
    python train_model.py
    echo.
) else (
    echo [OK] Model files found. Skipping training.
)

:: ============================================================
:: STEP 3 — Clear Python cache
:: (prevents stale .pyc files from breaking imports)
:: ============================================================

echo.
echo [STEP 3] Clearing Python cache...

for /d /r . %%d in (__pycache__) do (
    if exist "%%d" rmdir /s /q "%%d"
)

echo [OK] Cache cleared.

:: ============================================================
:: STEP 4 — Start FastAPI server
:: ============================================================

echo.
echo [STEP 4] Starting FastAPI server...
echo.
echo =======================================================
echo   Server starting at: http://127.0.0.1:8000
echo   Swagger docs at:    http://127.0.0.1:8000/docs
echo   Health check at:    http://127.0.0.1:8000/api/v1/health/
echo =======================================================
echo.
echo   Press CTRL+C to stop the server.
echo.

python -m uvicorn main:app --reload

:: ============================================================
:: Keep window open if server crashes
:: ============================================================

echo.
echo [INFO] Server stopped.
pause