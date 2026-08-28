@echo off
setlocal enabledelayedexpansion

:: 対象ファイルを指定
set FILES=typing.js style.css type.html index.css

:: バッチファイルの存在する場所（cpfileフォルダ）と親フォルダを取得
set "SRC_DIR=%~dp0"
:: 末尾の円マークを除去
if "%SRC_DIR:~-1%"=="\" set "SRC_DIR=%SRC_DIR:~0,-1%"

:: ひとつ上の階層（親フォルダ）を取得
for %%a in ("%SRC_DIR%\..") do set "PARENT_DIR=%%~fa"

:: 親フォルダ配下を深さ問わず走査
for /r "%PARENT_DIR%" /d %%i in (*) do (
    :: コピー元フォルダ自体（cpfile）およびその配下は処理対象から除外
    set "TARGET_PATH=%%~fi"
    if /i "!TARGET_PATH:%SRC_DIR%=!"=="!TARGET_PATH!" (
        set "UPDATED=0"
        
        for %%f in (%FILES%) do (
            :: コピー先にファイルが存在し、かつ cpfile 内にも同名ファイルが存在する場合のみコピー
            if exist "%%i\%%f" if exist "%SRC_DIR%\%%f" (
                copy /y "%SRC_DIR%\%%f" "%%i\" >nul
                set "UPDATED=1"
            )
        )
        
        if !UPDATED! equ 1 (
            echo [更新完了] %%i
        )
    )
)

endlocal
pause