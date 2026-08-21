@REM Licensed to the Apache Software Foundation (ASF)
@REM Maven Wrapper startup batch script for Windows

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"

if exist %WRAPPER_JAR% (
    "%JAVA_HOME%\bin\java.exe" -jar %WRAPPER_JAR% %*
    if ERRORLEVEL 1 (
        java -jar %WRAPPER_JAR% %*
    )
) else (
    echo Maven Wrapper jar not found at %WRAPPER_JAR%
    echo Attempting to use system Maven...
    mvn %*
)

endlocal
