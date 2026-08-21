@echo off
cd /d "C:\Program Files\PostgreSQL\18\bin"
pg_ctl.exe start -D "C:\Program Files\PostgreSQL\18\data"
echo PostgreSQL startup initiated
