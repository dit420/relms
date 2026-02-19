New-Item -ItemType Directory -Force -Path 'public\photos\adit','public\photos\anya' | Out-Null

$src = 'C:\Users\Adit Singh\Pictures\relms adit'
$files = Get-ChildItem $src -Filter '*.jpeg' | Sort-Object Name
$i = 1
foreach($f in $files) {
    Copy-Item $f.FullName -Destination "public\photos\adit\photo_$i.jpeg" -Force
    $i++
}
Write-Host "Copied $($i-1) Adit files"

$src2 = 'C:\Users\Adit Singh\Pictures\relms onion'
$files2 = Get-ChildItem $src2 -Filter '*.jpeg' | Sort-Object Name
$j = 1
foreach($f in $files2) {
    Copy-Item $f.FullName -Destination "public\photos\anya\photo_$j.jpeg" -Force
    $j++
}
Write-Host "Copied $($j-1) Anya files"
