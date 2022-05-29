# Copyright (C) 2022 reallyread.it, inc.
#
# This file is part of Readup.
#
# Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
#
# Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

$targetDir = $args[0]

if (-not (Test-Path $targetDir)) {
	Write-Host 'Target directory not found'
	Exit
}

Write-Host 'Copying build scripts...'
Robocopy.exe build $(Join-Path $targetDir 'build') /MIR /XF client.js embed.js metadataParser.js server.js /XD client embed nativeClient

Write-Host 'Copying source files...'
Robocopy.exe src/common $(Join-Path $targetDir 'src/common') /MIR
Robocopy.exe src/extension $(Join-Path $targetDir 'src/extension') /MIR

Write-Host 'Copying root files...'
Copy-Item package-lock.json $targetDir
Copy-Item package.json $targetDir
Copy-Item tsconfig.json $targetDir

Write-Host 'Running build...'
Push-Location $targetDir
npm ci
node node_modules/gulp/bin/gulp.js build:prod:extension

Write-Host 'Creating zip file...'
Compress-Archive -Path build,src,gulpfile.js,package-lock.json,package.json,readme.md,tsconfig.json -DestinationPath archive.zip

Pop-Location