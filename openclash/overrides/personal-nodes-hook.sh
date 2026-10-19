#!/bin/sh
# Call from the existing overwrite hook after CONFIG_FILE is available.
set -eu
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo 'Expected one existing runtime configuration path' >&2
  exit 2
fi
for source in personal-nodes.rb personal-nodes.yaml personal-ai-rules.yaml; do
  if [ ! -r "/etc/openclash/custom/$source" ]; then
    echo 'Missing required personal-node source file' >&2
    exit 2
  fi
done
exec ruby /etc/openclash/custom/personal-nodes.rb "$1"
