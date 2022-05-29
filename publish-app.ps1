# Copyright (C) 2022 reallyread.it, inc.
#
# This file is part of Readup.
#
# Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
#
# Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

$outputDir = 'bin/prod/app'
$publishDir = 'pub/app'
$packageDir = 'pkg/app'

Write-Host 'Checking version...'
$project = Get-Content package.json | ConvertFrom-Json
$version = $project.{it.reallyread}.version.app
$versionDir = "$packageDir/$version"
$archivePath = "$versionDir/app-$version.zip"
if (Test-Path $versionDir) {
	Write-Error "Package version $version already exists." -ErrorAction Stop
}

Write-Host 'Cleaning...'
npx gulp clean:prod:app

Write-Host 'Building...'
npx gulp build:prod:app

if (-not (Test-Path $publishDir)) {
	Write-Host 'Creating publish directory...'
	New-Item $publishDir -ItemType Directory
}

Write-Host 'Cleaning publish directory...'
# added -Force because .well-known is a hidden file https://stackoverflow.com/a/25806947/4973029
Get-ChildItem $publishDir -Exclude node_modules | Remove-Item -Recurse -Force

Write-Host 'Copying program files to publish directory...'
Copy-Item -Path $outputDir/* -Destination $publishDir -Recurse

Write-Host 'Creating package directory...'
New-Item $versionDir -ItemType Directory

Write-Host 'Moving static bundles to package directory...'
Move-Item -Path $publishDir/client/bundle-$Version.* -Destination $versionDir

Write-Host 'Installing packages...'
Push-Location $publishDir
npm ci --production
Pop-Location

Write-Host "Creating archive at $archivePath..."
Compress-Archive -Path $publishDir/* -DestinationPath $archivePath