# COMPASS CONFIG
# http://compass-style.org/help/tutorials/configuration-reference/

# Plugins
# =======
# Require any compass plugins you need
require 'stitch'
# require 'modular-scale'
# require 'susy'

# Config
# ======

project_type      = :stand_alone # :stand_alone or :rails
environment       = :development # :production or :development
preferred_syntax  = :scss # :sass or :scss
http_path         = "/"
css_dir           = "public/css"
sass_dir          = "public/css/_sass"
images_dir        = "public/images"
javascripts_dir   = "public/js"
fonts_dir         = "public/css/fonts"
relative_assets   = true

# Disable query vars image.png?1234 when using asset helpers, e.g., image-url()
asset_cache_buster  :none

# Defaults to false in production mode, true in development mode.
line_comments     = false
color_output      = false

# Uncomment this line if you want to debug using FireSass
# sass_options = {:debug_info => true}

# Choose your output style, :nested, :extended, :compact, :compressed
output_style = (environment == :production) ? :compressed : :expanded
# To call: compass compile -e production -s compressed --force
