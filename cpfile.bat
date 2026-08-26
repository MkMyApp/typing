@echo off
setlocal enabledelayedexpansion
set FILES=typing.js style.css type.html index.css

rem /r オプションで、階層の深さを問わず全てのサブフォルダを走査します
for /r /d %%i in (*) do (
    rem フラグを初期化
    set UPDATED=0
    
    for %%f in (%FILES%) do (
        rem 各フォルダの中にファイルが実在する場合のみコピー
        if exist "%%i\%%f" (
            copy /y "%%f" "%%i\" >nul
            set UPDATED=1
        )
    )
    
    rem どちらかのファイル（または両方）が更新されていたら1行だけ出力
    if !UPDATED! equ 1 (
        echo [更新完了] %%i
    )
)
endlocal
pause