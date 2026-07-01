$ErrorActionPreference = 'Stop'

$appRoot = Split-Path -Parent $PSScriptRoot
$parentRoot = Split-Path -Parent $appRoot
$source = Join-Path $appRoot 'node_modules'
$target = Join-Path $parentRoot 'node_modules'

if ((Test-Path $target) -and -not (Test-Path $source)) {
  Write-Output "Dependencies already externalized at $target"
  exit 0
}

if (-not (Test-Path $source)) {
  throw "No local node_modules found at $source. Run npm install first."
}

if (Test-Path $target) {
  throw "Target already exists at $target. Remove or rename it before externalizing dependencies."
}

Move-Item -LiteralPath $source -Destination $target
Write-Output "Moved node_modules to $target"
