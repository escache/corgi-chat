#!/usr/bin/env bash
# Set up Clerk authentication for corgi-chat using the Clerk CLI.
# Docs: https://clerk.com/docs/cli
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLERK_APP_ID="${CLERK_APP_ID:-app_3Ft5xpoyXsOPw6zYR2vgn6XLas0}"
WEB_DIR="${ROOT_DIR}/apps/web"
ENV_FILE="${WEB_DIR}/.env.local"
MIDDLEWARE_FILE="${WEB_DIR}/src/middleware.ts"

info() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

ensure_path() {
  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    export PATH="$HOME/.local/bin:$PATH"
  fi
}

install_clerk_cli() {
  if command -v clerk >/dev/null 2>&1; then
    info "Clerk CLI found: $(clerk --version 2>/dev/null || echo unknown)"
    info "Updating Clerk CLI..."
    clerk update --yes
    return
  fi

  info "Clerk CLI not found. Installing..."

  if command -v brew >/dev/null 2>&1; then
    brew install clerk/stable/clerk
  elif command -v pnpm >/dev/null 2>&1; then
    pnpm install -g clerk
  elif command -v npm >/dev/null 2>&1; then
    npm install -g clerk
  elif command -v curl >/dev/null 2>&1; then
    curl -fsSL https://clerk.com/install | bash
    ensure_path
  else
    die "No supported install method found. Install manually: https://clerk.com/docs/cli"
  fi

  command -v clerk >/dev/null 2>&1 || die "Clerk CLI install failed. Add ~/.local/bin to PATH and retry."
  info "Installed: $(clerk --version)"
}

sign_in() {
  info "Signing in to Clerk (browser OAuth)..."
  warn "Complete the login flow in your browser when prompted."
  clerk auth login
}

init_clerk() {
  cd "$ROOT_DIR"

  if [[ ! -f "$ROOT_DIR/package.json" ]]; then
    die "Run this script from the corgi-chat repo root."
  fi

  info "Linking project to Clerk app ${CLERK_APP_ID}..."
  clerk init --app "$CLERK_APP_ID" --yes --no-skills
}

verify_middleware_matcher() {
  if [[ ! -f "$MIDDLEWARE_FILE" ]]; then
    warn "No middleware.ts found — skip matcher check."
    return
  fi

  if grep -q "'/__clerk/:path\*'" "$MIDDLEWARE_FILE" || grep -q '"/__clerk/:path\*"' "$MIDDLEWARE_FILE"; then
    info "middleware.ts already includes '/__clerk/:path*' matcher."
  else
    warn "Add '/__clerk/:path*' to config.matcher in apps/web/src/middleware.ts"
    warn "It should appear after '/(api|trpc)(.*)'."
  fi
}

pull_env_if_needed() {
  if command -v clerk >/dev/null 2>&1 && clerk whoami >/dev/null 2>&1; then
    info "Pulling Clerk environment variables into apps/web/.env.local..."
    if clerk env pull --help >/dev/null 2>&1; then
      (cd "$WEB_DIR" && clerk env pull) || warn "clerk env pull failed — copy keys from the dashboard manually."
    fi
  fi
}

doctor() {
  info "Running clerk doctor..."
  (cd "$ROOT_DIR" && clerk doctor) || warn "clerk doctor reported issues — review output above."
}

print_next_steps() {
  cat <<EOF

Clerk setup commands finished.

Next steps:
  1. Ensure apps/web/.env.local has Clerk keys (clerk init / env pull should write them).
  2. Start the app:  pnpm dev
  3. Open http://localhost:3000 and use Sign up to create your first test user.
  4. After signup, you should see your profile icon in the header.

Clerk app: ${CLERK_APP_ID}
Dashboard: https://dashboard.clerk.com/

EOF
}

main() {
  ensure_path
  install_clerk_cli
  sign_in
  init_clerk
  verify_middleware_matcher
  pull_env_if_needed
  doctor
  print_next_steps
}

main "$@"
