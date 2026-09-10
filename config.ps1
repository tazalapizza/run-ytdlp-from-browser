<#*==========================================================================
* ℹ   User Configuration File (config.ps1)
  Place this file in the same directory as "yt-download.ps1".
  And rename it "config.ps1"
  Documentation: https://github.com/Fred-Vatin/run-yt-dlp-from-browser/wiki/How-to-setup-and-use%E2%80%AF%3F
===========================================================================#>

# Force the script to run in verbose mode.
# Useful for debug before opening an issue.
New-Variable -Name Verbose -Value $false -Option Constant

# ---------------------------------------------------------------------------
# 1. PATHS & DIRECTORIES
# ---------------------------------------------------------------------------

# Subfolder name created inside the default OS Downloads directory
New-Variable -Name DownloadFolderName -Value "downloads" -Option Constant

# Custom parent download directory (uncomment to override OS default)
# Note: Files will be saved in "$DownloadsPath/$DownloadFolderName"
New-Variable -Name DownloadsPath -Value "E:\" -Option Constant

# ---------------------------------------------------------------------------
# 2. MEDIA SETTINGS & QUALITY
# ---------------------------------------------------------------------------

# Default video format/quality (optimized for social media uploads like X/Twitter)
New-Variable -Name VideoQuality -Value "bestvideo*[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo*+bestaudio/best"

# Default video container extension
New-Variable -Name VideoContainer -Value "mp4" -Option Constant

# URLs that should automatically trigger audio-only downloads
New-Variable -Name AutoAudio -Value @("https://music.youtube.com/watch?v=") -Option Constant

# Default quality used for "audio" downloads when the URL doesn't specify one.
# "m4a" converts/downloads to m4a (AAC) at the best available quality.
New-Variable -Name DefaultAudioQuality -Value "m4a" -Option Constant

# ---------------------------------------------------------------------------
# 3. FILE NAMING TEMPLATES
# ---------------------------------------------------------------------------

# Artist first, falling back through the creator/uploader fields when the
# source does not provide music-specific artist metadata.
New-Variable -Name TemplateNameChannel -Value "%(artist,artists,creator,creators,uploader,uploader_id|Unknown)s - %(title).70s.%(ext)s" -Option Constant

# Keep the same naming shape even when this legacy toggle is enabled.
New-Variable -Name TemplateNameTitle -Value "%(artist,artists,creator,creators,uploader,uploader_id|Unknown)s - %(title).70s.%(ext)s" -Option Constant

# Retained for compatibility with the script; both templates now use
# "artist - title".
New-Variable -Name UseTitle -Value $true -Option Constant

# ---------------------------------------------------------------------------
# 4. AUTHENTICATION (COOKIES)
# ---------------------------------------------------------------------------

# Enable browser cookies extraction (highly recommended to avoid blocks)
New-Variable -Name UseBrowserCookies -Value $true -Option Constant

# Browser and optional profile name for cookie extraction (e.g., "firefox", "chrome", "edge")
New-Variable -Name BrowserCookies -Value "firefox" -Option Constant

# Path to a dedicated cookies.txt file (not recommended for security reasons) (not a constant)
# Leave empty since UseBrowserCookies is enabled above.
New-Variable -Name myCookies -Value ""

# ---------------------------------------------------------------------------
# 5. EXTERNAL TOOLS
# ---------------------------------------------------------------------------

# Path to the YDL-UI graphical interface executable
# Not installed on this machine, so left empty (the "showUI" download type won't be usable).
New-Variable -Name UI_Path -Value "" -Option Constant

# JavaScript runtime used by recent yt-dlp versions to improve download speed
# Comment this line to let yt-dlp auto-detect or use the slower fallback.
# See: https://github.com/yt-dlp/yt-dlp/wiki/ejs
# Bun is not installed on this machine; Node.js is available at C:\nvm4w\nodejs\node.exe,
# but yt-dlp's --js-runtimes flag currently expects "bun"/"deno"/"node" - node works too.
New-Variable -Name JsRuntime -Value "node" -Option Constant

# ---------------------------------------------------------------------------
# 6. USER EXPERIENCE & INTERFACE
# ---------------------------------------------------------------------------

# Automatically open file explorer and select the file once downloaded
New-Variable -Name SelectDownloadedFile -Value $true -Option Constant

# Enable colored console output (set to $false if characters render poorly)
New-Variable -Name UseColorfulOutput -Value $true -Option Constant

# Play an audio alert upon download success or failure
New-Variable -Name PlaySound -Value $true -Option Constant
