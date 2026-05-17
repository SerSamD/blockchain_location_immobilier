#!/usr/bin/env pwsh
# One-time project setup script for Windows PowerShell
Set-StrictMode -Version Latest
Write-Output "Starting one-time setup..."
Push-Location (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
# move to project root
Set-Location ..

if (Test-Path package-lock.json) {
    Write-Output "Installing dependencies with npm ci..."
    npm ci
} else {
    Write-Output "Installing dependencies with npm install..."
    npm install
}

Write-Output "Compiling Solidity contracts (npx truffle compile)..."
npx truffle compile || Write-Output "Truffle compile failed or not available; continue."

if (-not (Test-Path .env) -and (Test-Path .env.example)) {
    Write-Output "Creating .env from .env.example (fill values before deploying)..."
    Copy-Item .env.example .env
}

Write-Output "Building frontend (npm run build)..."
npm run build || Write-Output "Build failed; check errors."

Write-Output "One-time setup complete. Review .env and DEPLOY.md before deploying to a live network."
Pop-Location
