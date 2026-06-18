# Create audio directory if it doesn't exist
if (-not (Test-Path -Path "audio")) {
    New-Item -ItemType Directory -Path "audio" | Out-Null
}

# Scan audio directory for mp3 and wav files
$files = Get-ChildItem -Path "audio" -File | Where-Object { $_.Extension -match '^\.(mp3|wav|ogg)$' }
$list = @()
foreach ($file in $files) {
    $list += $file.Name
}

# Construct JS array string
$jsonElements = @()
foreach ($item in $list) {
    # Escape quotes if they exist in file name
    $escaped = $item -replace '"', '\"'
    $jsonElements += """$escaped"""
}
$jsContent = "window.AUDIO_TRACKS = [" + ($jsonElements -join ",") + "];"

# Write to audio/audio_list.js
$jsContent | Out-File -FilePath "audio/audio_list.js" -Encoding utf8
Write-Host "Updated audio/audio_list.js with $($list.Count) files."
