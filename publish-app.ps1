& node_modules/.bin/gulp.ps1 build:prod:app

$outputDir = 'bin/prod/app'
$publishDir = 'pub/app'
$archiveDir = 'pkg/app'

if (-not (Test-Path $publishDir)) {
	Write-Host 'Creating publish directory...'
	New-Item $publishDir -ItemType Directory
}

Write-Host 'Cleaning publish directory...'
Get-ChildItem $publishDir -Recurse |
	Select-Object -ExpandProperty FullName |
	Where-Object { $_ -notlike '*node_modules*' } |
	Sort-Object Length -Descending |
	Remove-Item

Write-Host 'Copying program files to publish directory...'
Copy-Item -Path $outputDir/* -Destination $publishDir -Recurse

Write-Host 'Installing packages...'
Push-Location $publishDir
npm install --production
Pop-Location

Write-Host 'Reading package version...'
$package = Get-Content package.json | ConvertFrom-Json
$archivePath = "$archiveDir/app-$($package.{it.reallyread}.version.app).zip"

if (-not (Test-Path $archiveDir)) {
	Write-Host 'Creating archive directory...'
	New-Item $archiveDir -ItemType Directory
}

Write-Host "Creating archive at $archivePath..."
Compress-Archive -Path $publishDir/* -DestinationPath $archivePath