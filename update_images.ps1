# Create feed_images directory if it doesn't exist
if (-not (Test-Path -Path "feed_images")) {
    New-Item -ItemType Directory -Path "feed_images" | Out-Null
}

# Scan feed_images directory for image files
$files = Get-ChildItem -Path "feed_images" -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp|gif)$' }
$list = @()
foreach ($file in $files) {
    $list += $file.Name
}

# Construct JS array string
$jsonElements = @()
foreach ($item in $list) {
    # Escape quotes if they exist in file name
    $escaped = $item -replace '"', '\"'
    $jsonElements += """feed_images/$escaped"""
}
$jsContent = "window.FEED_IMAGES = [" + ($jsonElements -join ",") + "];"

# Write to feed_images/image_list.js
$jsContent | Out-File -FilePath "feed_images/image_list.js" -Encoding utf8
Write-Host "Updated feed_images/image_list.js with $($list.Count) files."
