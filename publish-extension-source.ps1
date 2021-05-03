$targetDir = $args[0]

if (-not (Test-Path $targetDir)) {
	Write-Host 'Target directory not found'
	Exit
}

Write-Host 'Copying build scripts...'
Robocopy.exe build $(Join-Path $targetDir 'build') /MIR /XF client.js server.js /XD client embed nativeClient

Write-Host 'Copying source files...'
Robocopy.exe src/common $(Join-Path $targetDir 'src/common') /MIR
Robocopy.exe src/extension $(Join-Path $targetDir 'src/extension') /MIR

Write-Host 'Copying root files...'
Copy-Item npm-shrinkwrap.json $targetDir
Copy-Item package.json $targetDir
Copy-Item tsconfig.json $targetDir

Write-Host 'Running build...'
Push-Location $targetDir
npm ci
node node_modules/gulp/bin/gulp.js build:prod:extension

Write-Host 'Creating zip file...'
Compress-Archive -Path build,src,gulpfile.js,npm-shrinkwrap.json,package.json,readme.md,tsconfig.json -DestinationPath archive.zip

Pop-Location