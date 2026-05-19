#!/bin/sh
set -e
script_dir="$(cd "$(dirname "$0")" && pwd)"
src="$script_dir/hooks/pre-push"
dest="$script_dir/../.git/hooks/pre-push"
cp "$src" "$dest"
chmod +x "$dest"
echo "Hook installed to $dest"
