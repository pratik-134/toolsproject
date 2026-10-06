Add-Type -AssemblyName System.Drawing

Write-Host "=== QWERTYGEN BRAND ASSET COMPILATION ENGINE (V2.1 - TIGHT LOCKUP & TRANSPARENT FAVICON) ===" -ForegroundColor Cyan

# 1. PATH DEFINITIONS
$publicDir = "$PSScriptRoot\..\public"
$brandDir = "$publicDir\brand"
$appDir = "$PSScriptRoot\..\app"

if (-not (Test-Path $brandDir)) {
    New-Item -ItemType Directory -Path $brandDir -Force | Out-Null
}

# 2. VECTOR OUTLINE GENERATOR FOR SVG WORDMARK
# Converts "[Q]wertygen" into SVG path outlines using .NET GraphicsPath (No double Q, tight spacing)
function Export-Outlined-Logo-Svg([string]$theme, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap(360, 64)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Try fonts in order: Plus Jakarta Sans -> Sora -> Segoe UI -> Arial
    $fontName = "Segoe UI"
    $candidateFonts = @("Plus Jakarta Sans", "Sora", "Segoe UI Semibold", "Segoe UI", "Arial")
    $installed = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
    foreach ($cand in $candidateFonts) {
        if ($installed -contains $cand) {
            $fontName = $cand
            break
        }
    }

    $ff = New-Object System.Drawing.FontFamily($fontName)
    $fontStyle = [int][System.Drawing.FontStyle]::Bold

    # Generate path for "werty" (starts immediately at x=60 right next to the Q mark)
    $pathWerty = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ptWerty = New-Object System.Drawing.PointF(60, 12)
    $fmt = New-Object System.Drawing.StringFormat
    $pathWerty.AddString("werty", $ff, $fontStyle, 34, $ptWerty, $fmt)

    # Measure width of "werty" to position "gen" with tight tracking (-1.5px)
    $boundsW = $pathWerty.GetBounds()
    $genX = $boundsW.Right - 1.5

    # Generate path for "gen"
    $pathGen = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ptGen = New-Object System.Drawing.PointF($genX, 12)
    $pathGen.AddString("gen", $ff, $fontStyle, 34, $ptGen, $fmt)

    # Convert System.Drawing.Drawing2D.GraphicsPath into SVG Path d-string
    function PathToSvgData([System.Drawing.Drawing2D.GraphicsPath]$gp) {
        $sb = New-Object System.Text.StringBuilder
        $points = $gp.PathPoints
        $types = $gp.PathTypes

        $i = 0
        while ($i -lt $points.Length) {
            $type = $types[$i]
            $p = $points[$i]
            $pointType = $type -band 0x07

            if ($pointType -eq 0) { # StartPoint
                [void]$sb.AppendFormat("M {0:F1} {1:F1} ", $p.X, $p.Y)
                $i++
            } elseif ($pointType -eq 1) { # Line
                [void]$sb.AppendFormat("L {0:F1} {1:F1} ", $p.X, $p.Y)
                $i++
            } elseif ($pointType -eq 3) { # Bezier
                if ($i + 2 -lt $points.Length) {
                    $p1 = $points[$i]
                    $p2 = $points[$i+1]
                    $p3 = $points[$i+2]
                    [void]$sb.AppendFormat("C {0:F1} {1:F1} {2:F1} {3:F1} {4:F1} {5:F1} ", $p1.X, $p1.Y, $p2.X, $p2.Y, $p3.X, $p3.Y)
                    $i += 3
                } else {
                    $i++
                }
            } else {
                $i++
            }

            if (($type -band 0x80) -ne 0) { # CloseSubpath
                [void]$sb.Append("Z ")
            }
        }
        return $sb.ToString().Trim()
    }

    $dWerty = PathToSvgData $pathWerty
    $dGen = PathToSvgData $pathGen
    $wertyFill = if ($theme -eq "dark") { "#FFFFFF" } else { "#0F172A" }

    $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" fill="none" width="100%" height="100%">
  <defs>
    <linearGradient id="qRibbonGradOut" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="55%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#06D6A0" />
    </linearGradient>
    <linearGradient id="qGenTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#06D6A0" />
    </linearGradient>
  </defs>

  <!-- Continuous Ribbon Q Logomark (ViewBox 6 6 52 52 mapped tightly to x=2) -->
  <g transform="translate(0, 0)">
    <path
      d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 38.2 54 43.8 51.4 47.8 47.3 L 34 33.5 C 32.5 32 32.5 29.5 34 28 C 35.5 26.5 38 26.5 39.5 28 L 54 42.5"
      stroke="url(#qRibbonGradOut)"
      stroke-width="6.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M 32 10 C 44.15 10 54 19.85 54 32 C 54 35.8 53 39.4 51.3 42.5"
      stroke="#2563EB"
      stroke-width="6.5"
      stroke-linecap="round"
    />
  </g>

  <!-- Outlined Typography: "werty" (Single Q, Zero Double Q) -->
  <path d="$dWerty" fill="$wertyFill" />

  <!-- Outlined Typography: "gen" (Gradient Filled) -->
  <path d="$dGen" fill="url(#qGenTextGrad)" />
</svg>
"@
    Set-Content -Path $outPath -Value $svgContent -Encoding UTF8
    Write-Host "  -> Generated outlined SVG: $outPath" -ForegroundColor Green

    $g.Dispose()
    $bmp.Dispose()
}

# 3. HIGH-RESOLUTION BITMAP RENDERER (System.Drawing)
function Draw-Ribbon-Q([System.Drawing.Graphics]$g, [float]$size, [float]$offsetX = 0, [float]$offsetY = 0, [bool]$monochrome = $false, [string]$monoColor = "#FFFFFF", [float]$customStroke = 0) {
    $scale = $size / 64.0

    $pt1 = New-Object System.Drawing.PointF([float](12 * $scale + $offsetX), [float](12 * $scale + $offsetY))
    $pt2 = New-Object System.Drawing.PointF([float](52 * $scale + $offsetX), [float](52 * $scale + $offsetY))
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#2563EB')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#06D6A0')

    $ribbonBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $c1, $c2)
    $strokeWidth = if ($customStroke -gt 0) { $customStroke } else { [float](6.5 * $scale) }

    $penRibbon = if ($monochrome) {
        New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($monoColor), $strokeWidth)
    } else {
        New-Object System.Drawing.Pen($ribbonBrush, $strokeWidth)
    }
    $penRibbon.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penRibbon.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penRibbon.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $penBlue = if ($monochrome) {
        New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($monoColor), $strokeWidth)
    } else {
        New-Object System.Drawing.Pen($c1, $strokeWidth)
    }
    $penBlue.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penBlue.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Primary ribbon path
    $pMain = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pMain.AddBezier(
        [float](32 * $scale + $offsetX), [float](10 * $scale + $offsetY),
        [float](19.85 * $scale + $offsetX), [float](10 * $scale + $offsetY),
        [float](10 * $scale + $offsetX), [float](19.85 * $scale + $offsetY),
        [float](10 * $scale + $offsetX), [float](32 * $scale + $offsetY)
    )
    $pMain.AddBezier(
        [float](10 * $scale + $offsetX), [float](32 * $scale + $offsetY),
        [float](10 * $scale + $offsetX), [float](44.15 * $scale + $offsetY),
        [float](19.85 * $scale + $offsetX), [float](54 * $scale + $offsetY),
        [float](32 * $scale + $offsetX), [float](54 * $scale + $offsetY)
    )
    $pMain.AddBezier(
        [float](32 * $scale + $offsetX), [float](54 * $scale + $offsetY),
        [float](38.2 * $scale + $offsetX), [float](54 * $scale + $offsetY),
        [float](43.8 * $scale + $offsetX), [float](51.4 * $scale + $offsetY),
        [float](47.8 * $scale + $offsetX), [float](47.3 * $scale + $offsetY)
    )
    $pMain.AddLine(
        [float](47.8 * $scale + $offsetX), [float](47.3 * $scale + $offsetY),
        [float](34 * $scale + $offsetX), [float](33.5 * $scale + $offsetY)
    )
    $pMain.AddBezier(
        [float](34 * $scale + $offsetX), [float](33.5 * $scale + $offsetY),
        [float](32.5 * $scale + $offsetX), [float](32 * $scale + $offsetY),
        [float](32.5 * $scale + $offsetX), [float](29.5 * $scale + $offsetY),
        [float](34 * $scale + $offsetX), [float](28 * $scale + $offsetY)
    )
    $pMain.AddBezier(
        [float](34 * $scale + $offsetX), [float](28 * $scale + $offsetY),
        [float](35.5 * $scale + $offsetX), [float](26.5 * $scale + $offsetY),
        [float](38 * $scale + $offsetX), [float](26.5 * $scale + $offsetY),
        [float](39.5 * $scale + $offsetX), [float](28 * $scale + $offsetY)
    )
    $pMain.AddLine(
        [float](39.5 * $scale + $offsetX), [float](28 * $scale + $offsetY),
        [float](54 * $scale + $offsetX), [float](42.5 * $scale + $offsetY)
    )
    $g.DrawPath($penRibbon, $pMain)

    # Upper facet path
    $pFacet = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pFacet.AddBezier(
        [float](32 * $scale + $offsetX), [float](10 * $scale + $offsetY),
        [float](44.15 * $scale + $offsetX), [float](10 * $scale + $offsetY),
        [float](54 * $scale + $offsetX), [float](19.85 * $scale + $offsetY),
        [float](54 * $scale + $offsetX), [float](32 * $scale + $offsetY)
    )
    $pFacet.AddBezier(
        [float](54 * $scale + $offsetX), [float](32 * $scale + $offsetY),
        [float](54 * $scale + $offsetX), [float](35.8 * $scale + $offsetY),
        [float](53 * $scale + $offsetX), [float](39.4 * $scale + $offsetY),
        [float](51.3 * $scale + $offsetX), [float](42.5 * $scale + $offsetY)
    )
    $g.DrawPath($penBlue, $pFacet)

    $penRibbon.Dispose()
    $penBlue.Dispose()
    $ribbonBrush.Dispose()
}

# RENDER APP ICON BITMAP (With Optional Squircle or 100% Transparent)
function Render-App-Icon([int]$size, [string]$outPath, [bool]$transparent = $false) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if (-not $transparent) {
        $pt1 = New-Object System.Drawing.PointF(0, 0)
        $pt2 = New-Object System.Drawing.PointF($size, $size)
        $c1 = [System.Drawing.ColorTranslator]::FromHtml('#0B132B')
        $c2 = [System.Drawing.ColorTranslator]::FromHtml('#0F172A')
        $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $c1, $c2)

        $radius = [float]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc(0, 0, [float]($radius * 2), [float]($radius * 2), 180, 90)
        $path.AddArc([float]($size - $radius * 2), 0, [float]($radius * 2), [float]($radius * 2), 270, 90)
        $path.AddArc([float]($size - $radius * 2), [float]($size - $radius * 2), [float]($radius * 2), [float]($radius * 2), 0, 90)
        $path.AddArc(0, [float]($size - $radius * 2), [float]($radius * 2), [float]($radius * 2), 90, 90)
        $path.CloseFigure()
        $g.FillPath($bgBrush, $path)

        $borderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#1E293B'), [float]([Math]::Max(1, $size * 0.008)))
        $g.DrawPath($borderPen, $path)
        $borderPen.Dispose()
        $bgBrush.Dispose()

        $markSize = $size * 0.72
        $offset = ($size - $markSize) / 2.0
        Draw-Ribbon-Q $g $markSize $offset $offset
    } else {
        # Transparent background: mark occupies 86% of canvas for maximum tab visibility
        $markSize = $size * 0.86
        $offset = ($size - $markSize) / 2.0
        $customStroke = [float]([Math]::Max(2.0, 7.5 * ($markSize / 64.0)))
        Draw-Ribbon-Q $g $markSize $offset $offset $false "#FFFFFF" $customStroke
    }

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  -> Rendered PNG: $outPath ($size x $size, Transparent=$transparent)" -ForegroundColor Green

    $g.Dispose()
    $bmp.Dispose()
}

# 4. RENDER ALL SIZES
Write-Host "Generating Multi-Resolution PNGs..." -ForegroundColor Yellow
# App icons (dark squircle for PWA and Apple touch icon)
Render-App-Icon 512 "$publicDir\icon.png" $false
Render-App-Icon 512 "$brandDir\logo-icon.png" $false
Render-App-Icon 512 "$brandDir\logo-icon-512.png" $false
Render-App-Icon 192 "$brandDir\logo-icon-192.png" $false
Render-App-Icon 180 "$publicDir\apple-icon.png" $false
Render-App-Icon 180 "$publicDir\apple-touch-icon.png" $false

# 100% TRANSPARENT FAVICON PNGs & ICONS (As explicitly requested by user)
Write-Host "Generating 100% Transparent Favicons..." -ForegroundColor Yellow
Render-App-Icon 512 "$publicDir\favicon.png" $true
Render-App-Icon 32  "$brandDir\logo-icon-32.png" $true

# White background variant
$bmpW = New-Object System.Drawing.Bitmap(512, 512)
$gW = [System.Drawing.Graphics]::FromImage($bmpW)
$gW.Clear([System.Drawing.Color]::White)
$gW.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Draw-Ribbon-Q $gW 368 72 72
$bmpW.Save("$brandDir\logo-icon-white-bg.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gW.Dispose(); $bmpW.Dispose()
Write-Host "  -> Rendered logo-icon-white-bg.png" -ForegroundColor Green

# 5. RENDER HORIZONTAL LOGO BANNERS (No double Q, tight spacing)
function Render-Horizontal-Logo([string]$outPath, [bool]$isDark = $true) {
    $bmp = New-Object System.Drawing.Bitmap(640, 160)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    if ($isDark) {
        $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0B132B'))
    } else {
        $g.Clear([System.Drawing.Color]::White)
    }

    # Draw mark at 105px
    Draw-Ribbon-Q $g 105 28 27

    # Draw typography: "werty" + "gen" (tightly positioned right next to [Q] mark)
    $fontName = "Segoe UI"
    $candidateFonts = @("Plus Jakarta Sans", "Sora", "Segoe UI Semibold", "Segoe UI", "Arial")
    $installed = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
    foreach ($cand in $candidateFonts) {
        if ($installed -contains $cand) { $fontName = $cand; break }
    }
    $ff = New-Object System.Drawing.FontFamily($fontName)
    $font = New-Object System.Drawing.Font($ff, [float]52, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $textColor = if ($isDark) { [System.Drawing.Color]::White } else { [System.Drawing.ColorTranslator]::FromHtml('#0F172A') }
    $textBrushW = New-Object System.Drawing.SolidBrush($textColor)

    $pt1 = New-Object System.Drawing.PointF(320, 50)
    $pt2 = New-Object System.Drawing.PointF(520, 50)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#0EA5E9')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#06D6A0')
    $textBrushGen = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $c1, $c2)

    # Wordmark begins at x=136 immediately adjacent to the ribbon tail
    $g.DrawString("werty", $font, $textBrushW, [float]136, [float]38)
    $wSize = $g.MeasureString("werty", $font)
    $g.DrawString("gen", $font, $textBrushGen, [float](136 + $wSize.Width - 14), [float]38)

    # Subtitle
    $subFont = New-Object System.Drawing.Font($ff, [float]13, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $subColor = if ($isDark) { [System.Drawing.ColorTranslator]::FromHtml('#94A3B8') } else { [System.Drawing.ColorTranslator]::FromHtml('#64748B') }
    $subBrush = New-Object System.Drawing.SolidBrush($subColor)
    $g.DrawString("TOOLS FOR A SMARTER YOU", $subFont, $subBrush, [float]140, [float]96)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  -> Rendered horizontal banner: $outPath" -ForegroundColor Green

    $font.Dispose(); $subFont.Dispose(); $textBrushW.Dispose(); $textBrushGen.Dispose(); $subBrush.Dispose()
    $g.Dispose(); $bmp.Dispose()
}

Render-Horizontal-Logo "$brandDir\logo-horizontal.png" $true
Render-Horizontal-Logo "$brandDir\logo-full.png" $true
Render-Horizontal-Logo "$brandDir\logo-stacked.png" $true
Render-Horizontal-Logo "$brandDir\logo-horizontal-white-bg.png" $false

# 6. GENERATE SOCIAL OG CARD (1200 x 630)
function Render-OG-Card([string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap(1200, 630)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Dark background
    $pt1 = New-Object System.Drawing.PointF(0, 0)
    $pt2 = New-Object System.Drawing.PointF(1200, 630)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, [System.Drawing.ColorTranslator]::FromHtml('#0B132B'), [System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
    $g.FillRectangle($bgBrush, 0, 0, 1200, 630)

    # Accent top border
    $accentPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#2563EB'), 6)
    $g.DrawLine($accentPen, 0, 3, 1200, 3)

    # Ambient subtle ring
    $ambientPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(25, 14, 165, 233), 80)
    $g.DrawEllipse($ambientPen, 780, 50, 480, 480)

    # Continuous Ribbon Q mark at 220px
    Draw-Ribbon-Q $g 220 100 190

    # Typography: "werty" + "gen" seamlessly paired with [Q] mark
    $fontName = "Segoe UI"
    $candidateFonts = @("Plus Jakarta Sans", "Sora", "Segoe UI Semibold", "Segoe UI", "Arial")
    $installed = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
    foreach ($cand in $candidateFonts) {
        if ($installed -contains $cand) { $fontName = $cand; break }
    }
    $ff = New-Object System.Drawing.FontFamily($fontName)
    $fontTitle = New-Object System.Drawing.Font($ff, [float]88, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fontTagline = New-Object System.Drawing.Font($ff, [float]34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fontBadge = New-Object System.Drawing.Font($ff, [float]20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    $gGradPt1 = New-Object System.Drawing.PointF(630, 200)
    $gGradPt2 = New-Object System.Drawing.PointF(860, 200)
    $genBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($gGradPt1, $gGradPt2, [System.Drawing.ColorTranslator]::FromHtml('#0EA5E9'), [System.Drawing.ColorTranslator]::FromHtml('#06D6A0'))

    $g.DrawString("werty", $fontTitle, $brushWhite, [float]325, [float]180)
    $wSize = $g.MeasureString("werty", $fontTitle)
    $g.DrawString("gen", $fontTitle, $genBrush, [float](325 + $wSize.Width - 20), [float]180)

    # Tagline
    $g.DrawString("Tools for a Smarter You", $fontTagline, $brushWhite, [float]328, [float]285)

    # Privacy guarantee badge pill
    $badgeRect = New-Object System.Drawing.RectangleF(328, 355, 520, 52)
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 6, 214, 160))
    $badgePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#06D6A0'), 2)
    $g.FillRectangle($badgeBrush, $badgeRect)
    $g.DrawRectangle($badgePen, $badgeRect.X, $badgeRect.Y, $badgeRect.Width, $badgeRect.Height)

    $tealBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#06D6A0'))
    $g.DrawString("100% IN-BROWSER · ZERO SERVER UPLOADS", $fontBadge, $tealBrush, [float]352, [float]368)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  -> Rendered OG social card: $outPath (1200 x 630)" -ForegroundColor Green

    $fontTitle.Dispose(); $fontTagline.Dispose(); $fontBadge.Dispose()
    $brushWhite.Dispose(); $genBrush.Dispose()
    $badgeBrush.Dispose(); $badgePen.Dispose(); $tealBrush.Dispose()
    $g.Dispose(); $bmp.Dispose()
}

Render-OG-Card "$publicDir\og-image.png"
Render-OG-Card "$publicDir\og-default.png"

# 7. GENERATE 100% TRANSPARENT MULTI-RESOLUTION FAVICON.ICO (16, 32, 48)
function Generate-Ico-File([string]$outPath) {
    $sizes = @(16, 32, 48)
    $pngBytesList = @()

    foreach ($s in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($s, $s)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

        # Pure transparent background, bold thick ribbon mark scaled to fill frame (88%)
        $markSize = [float]($s * 0.88)
        $offset = [float](($s - $markSize) / 2.0)
        $customStroke = [float]([Math]::Max(2.0, 7.8 * ($markSize / 64.0)))

        Draw-Ribbon-Q $g $markSize $offset $offset $false "#FFFFFF" $customStroke

        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBytesList += ,$ms.ToArray()
        $ms.Dispose(); $g.Dispose(); $bmp.Dispose()
    }

    # Build binary ICO file structure
    $icoMs = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($icoMs)

    # ICONDIR header: Reserved (0), Type (1 for ICO), Count (3 images)
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]3)

    $offset = 6 + (16 * 3) # Header (6 bytes) + 3 Directory entries (16 bytes each)
    for ($i = 0; $i -lt 3; $i++) {
        $s = $sizes[$i]
        $bytes = $pngBytesList[$i]
        $bw.Write([byte]$s)           # Width
        $bw.Write([byte]$s)           # Height
        $bw.Write([byte]0)            # Color count (0 for >=8bpp)
        $bw.Write([byte]0)            # Reserved
        $bw.Write([uint16]1)          # Color planes
        $bw.Write([uint16]32)         # Bits per pixel
        $bw.Write([uint32]$bytes.Length) # Image size in bytes
        $bw.Write([uint32]$offset)    # Offset to image data
        $offset += $bytes.Length
    }

    for ($i = 0; $i -lt 3; $i++) {
        $bw.Write($pngBytesList[$i])
    }

    [System.IO.File]::WriteAllBytes($outPath, $icoMs.ToArray())
    $bw.Dispose(); $icoMs.Dispose()
    Write-Host "  -> Generated 100% Transparent Multi-Resolution ICO (16/32/48): $outPath" -ForegroundColor Green
}

Generate-Ico-File "$publicDir\favicon.ico"
Generate-Ico-File "$appDir\favicon.ico"

# 8. EXPORT OUTLINED SVG LOGOS (No double Q, tight spacing)
Export-Outlined-Logo-Svg "light" "$brandDir\logo-light.svg"
Export-Outlined-Logo-Svg "dark" "$brandDir\logo-dark.svg"
Export-Outlined-Logo-Svg "dark" "$brandDir\logo-horizontal.svg"

Write-Host "`nAll brand assets successfully recompiled with transparent favicon & zero double Q!" -ForegroundColor Cyan
