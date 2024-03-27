echo "Attempting to finalise modules.js..."

{
  CLIENT_DIRECTORY="$(dirname "$(dirname "$(realpath "$0")")")"
  MODULE_DIRECTORY="$CLIENT_DIRECTORY/src/js/modules.js"
  MODULE_MIN_DIRECTORY="$CLIENT_DIRECTORY/src/js/modules.min.js"
  echo "$MODULE_DIRECTORY"
  browserify -t browserify-css "$MODULE_DIRECTORY" -o "$MODULE_DIRECTORY"
  uglifyjs "$MODULE_DIRECTORY" -mc > "$MODULE_MIN_DIRECTORY"
  echo "Modules compiled successfully..."
} || {
  echo "Build failed... ($__EXCEPTION_SOURCE__)"
  sleep 5s
}