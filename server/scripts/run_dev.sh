SERVER_DIRECTORY="$(dirname "$(dirname "$(realpath "$0")")")"
cd "$SERVER_DIRECTORY" || exit
npx tsc
npm run dev
