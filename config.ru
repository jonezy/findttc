require ::File.expand_path('../config/environment',  __FILE__)
require "rubygems"
require "bundler"
Bundler.require(:default)
use Rack::Deflater
map "/" do 
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
end
