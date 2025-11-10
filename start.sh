#!/usr/bin/env sh
set -e

WS_NAME="@webstudio-is/builder" 
APP_DIR="/app" 
BUILD_DIR="${APP_DIR}/apps/builder/build" 

echo "í ½í´Ž Checking build directory: ${BUILD_DIR}"

# (1) S'il n'y a pas encore de build, lance le build (builder + deps)
if [ ! -d "${BUILD_DIR}" ] || [ -z "$(ls -A "${BUILD_DIR}" 2>/dev/null)" ]; then 
  echo "âš ï¸ No build found. Building ${WS_NAME} (and deps)â€¦" 
  pnpm -r --filter "${WS_NAME}..." run build 
fi

# (2) DÃ©tecter l'entry serveur Remix : - prioritÃ©: build/server/**/index.js (Remix v2) - fallback: build/index.js (anciens templates)
SSR_ENTRY=""
if [ -f "${BUILD_DIR}/server/index.js" ]; then 
  SSR_ENTRY="${BUILD_DIR}/server/index.js" 
else
  # cherche le premier index.js sous build/server/*/index.js
  CANDIDATE=$(find "${BUILD_DIR}/server" -type f -name "index.js" -print 2>/dev/null | head -n 1 || true) 
  if [ -n "${CANDIDATE}" ]; then 
    SSR_ENTRY="${CANDIDATE}" 
  elif [ -f "${BUILD_DIR}/index.js" ]; then
    SSR_ENTRY="${BUILD_DIR}/index.js" 
  fi 
fi
 
if [ -z "${SSR_ENTRY}" ] || [ ! -f "${SSR_ENTRY}" ]; then 
  echo "âŒ Remix server entry not found." 
  echo "í ½í³‚ Current build tree:"
  find "${BUILD_DIR}" -maxdepth 3 -type d -print 
  echo "í ½í·‚ Files under build/server:" 
  find "${BUILD_DIR}/server" -maxdepth 3 -type f -name "index.js" -print 2>/dev/null || true 
  exit 1
fi
 
echo "âœ… Using server entry: ${SSR_ENTRY}" 
echo "í ½íº€ Starting remix-serveâ€¦"
exec pnpm --filter "${WS_NAME}" exec remix-serve "${SSR_ENTRY}"
