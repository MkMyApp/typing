@echo off
set FILES=typing.js style.css

rem /r オプションで、階層の深さを問わず全てのサブフォルダを走査します
for /r /d %%i in (*) do (
    for %%f in (%FILES%) do (
        rem 各フォルダの中にファイルが実在する場合のみコピー
        if exist "%%i\%%f" (
            copy /y "%%f" "%%i\"
            echo [更新完了] %%i\%%f
        )
    )
)
pause
