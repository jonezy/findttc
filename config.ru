require ::File.expand_path('../config/environment',  __FILE__)
use Rack::Deflater
use Rack::Static,
  :urls => ["/img", "/j", "/c"],
  :root => "public"

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('public/index.html', File::RDONLY)
  ]
}
