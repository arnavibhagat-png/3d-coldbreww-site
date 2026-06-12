# Simple PowerShell HTTP Server to serve static files for Velvet Drip Cold Brew website

$port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Server started and listening at http://localhost:$port/" -ForegroundColor Green
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Exit 1
}

# Keep running until stopped
$currentDirectory = Get-Location
Write-Host "Serving files from: $currentDirectory" -ForegroundColor Cyan

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/") {
            $rawPath = "/index.html"
        }
        
        # Build local file path
        $cleanPath = $rawPath.TrimStart('/')
        $localPath = Join-Path $currentDirectory $cleanPath
        
        # Check if file exists and serve it
        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "text/plain"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".png"  { $contentType = "image/png" }
                ".gif"  { $contentType = "image/gif" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".ico"  { $contentType = "image/x-icon" }
            }
            
            $content = [System.IO.File]::ReadAllBytes($localPath)
            
            # Write headers
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.AddHeader("Expires", "0")
            
            # Send file content
            $response.OutputStream.Write($content, 0, $content.Length)
            Write-Host "200 - $rawPath" -ForegroundColor Gray
        } else {
            # File not found
            $response.StatusCode = 404
            $response.ContentType = "text/plain; charset=utf-8"
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "404 - $rawPath" -ForegroundColor Yellow
        }
        $response.Close()
    } catch {
        Write-Host "Request handler error: $_" -ForegroundColor Red
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
