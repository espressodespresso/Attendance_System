tsc && echo "Compiling typescript..."
echo "Attempting to finalise index.js.."

{
  SCRIPT_DIRECTORY="$(dirname "$(realpath "$0")")"
  CLIENT_DIRECTORY="$(dirname "$SCRIPT_DIRECTORY")"
  INDEX_DIRECTORY="$CLIENT_DIRECTORY/src/js/index.js"
  INDEX_MIN_DIRECTORY="$CLIENT_DIRECTORY/src/js/index.min.js"
  browserify -t browserify-css "$INDEX_DIRECTORY" -o "$INDEX_DIRECTORY"
  uglifyjs "$INDEX_DIRECTORY" -mc > "$INDEX_MIN_DIRECTORY"
  echo "Index compiled successfully..."
  #source "$SCRIPT_DIRECTORY/build_modules.sh"
  echo "Complete..."
} || {
  echo "Build failed... ($__EXCEPTION_SOURCE__)"
  sleep 5s
}