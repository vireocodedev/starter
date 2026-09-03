#!/bin/sh
set -eu
root=/srv/www/vireocode
max=134217728
fail() { printf '%s\n' '{"error":"invalid receiver command"}' >&2; exit 64; }
valid() { printf '%s' "$1" | grep -Eq "$2"; }
set -f; IFS=' '; set -- ${SSH_ORIGINAL_COMMAND:-}; unset IFS
verb=${1:-}
case "$verb" in
  status) test "$#" = 1 || fail; exec sudo -n /usr/local/libexec/vireo-website-controller status ;;
  reconcile) test "$#" = 1 || fail; exec sudo -n /usr/local/libexec/vireo-website-controller reconcile ;;
  upload|stage) test "$#" = 7 || fail ;;
  activate|accept|rollback) test "$#" = 8 || fail ;;
  *) fail ;;
esac
run=$2 attempt=$3 repository=$4 commit=$5 digest=$6 bytes=$7 generation=${8:-}
valid "$run" '^[1-9][0-9]*$' && valid "$attempt" '^[1-9][0-9]*$' && test "$repository" = vireocodedev/vireo && valid "$commit" '^[a-f0-9]{40}$' && valid "$digest" '^[a-f0-9]{64}$' && valid "$bytes" '^[1-9][0-9]*$' && test "$bytes" -le "$max" || fail
case "$verb" in activate|accept|rollback) valid "$generation" '^[0-9]+$' || fail;; esac
if test "$verb" != upload; then
  case "$verb" in
    stage) exec sudo -n /usr/local/libexec/vireo-website-controller "$verb" "$run" "$attempt" "$repository" "$commit" "$digest" "$bytes" ;;
    *) exec sudo -n /usr/local/libexec/vireo-website-controller "$verb" "$run" "$attempt" "$repository" "$commit" "$digest" "$bytes" "$generation" ;;
  esac
fi
incoming="$root/incoming/$run-$attempt-$digest.tar"; mkdir -p "$root/incoming"; umask 077
exec 9>"$root/incoming/.receiver.lock"; flock -x 9
# Receiver-owned cleanup is bounded and never touches controller-private snapshots.
find "$root/incoming" -maxdepth 1 -type f \( -name '*.tar' -o -name '*.tmp.*' \) -mtime +1 -delete
if find "$root/incoming" -maxdepth 1 -type f ! \( -name '*.tar' -o -name '*.tmp.*' -o -name '.receiver.lock' \) -print -quit | grep -q .; then fail; fi
used=$(find "$root/incoming" -maxdepth 1 -type f ! -name '.receiver.lock' -printf '%s\n' | awk '{n+=$1} END {print n+0}')
test $((used + bytes)) -le $((max * 2)) || fail
tmp="$incoming.tmp.$$"; trap 'rm -f "$tmp"' EXIT HUP INT TERM
head -c "$bytes" > "$tmp"; test "$(wc -c < "$tmp" | tr -d ' ')" = "$bytes"; test "$(dd bs=1 count=1 status=none | wc -c | tr -d ' ')" = 0
test "$(sha256sum "$tmp" | awk '{print $1}')" = "$digest"
if test -f "$incoming"; then test "$(sha256sum "$incoming" | awk '{print $1}')" = "$digest"; else mv -f "$tmp" "$incoming"; fi
printf '{"status":"uploaded","runId":"%s","attempt":"%s"}\n' "$run" "$attempt"
