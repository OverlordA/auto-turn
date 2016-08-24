@echo off
echo.

start mongoDB\MongoDBPortable.exe

start /min node.exe server.js
