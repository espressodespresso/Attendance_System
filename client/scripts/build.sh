echo "Attempting to build.."

{
  tsc && echo "Compiling typescript..." &&
  browserify -t browserify-css ../src/js/index/js -o ../src.js/index.js && echo "Translating user browserify..." &&
  uglifyjs ../src/js/index.js -mc > ../src/js/index.min.js && echo "Minifying using uglifyjs..." &&
  echo "Success..."
} || {
  echo "Build failed... ($__EXCEPTION_SOURCE__)"
  sleep 10s
}