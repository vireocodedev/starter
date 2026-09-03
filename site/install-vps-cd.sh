#!/bin/sh
set -eu
test "$(id -u)" = 0 || { echo 'Run as root on the VPS.' >&2; exit 1; }
user=${1:-deploy}; key=${2:-}; source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
test -r "$key" || { echo 'Provide the reviewed GitHub deployment public key.' >&2; exit 1; }
id "$user" >/dev/null 2>&1 || { echo "Missing deployment user $user." >&2; exit 1; }
site_root=/srv/www/vireocode; control_root=/var/lib/vireo-website-deployment; group=$(id -gn "$user")
# The legacy bootstrap made this tree deploy-owned. Secure its top-level parent
# before inspecting children so the deployment user cannot swap paths while a
# privileged migration is in progress.
if test -L "$site_root" || { test -e "$site_root" && ! test -d "$site_root"; }; then echo 'Site root must be a real directory.' >&2; exit 1; fi
if ! test -e "$site_root"; then install -d -m 0755 -o root -g root "$site_root"; else chown root:root "$site_root"; chmod 0755 "$site_root"; fi
for child in releases incoming; do
  path="$site_root/$child"
  if test -L "$path" || { test -e "$path" && ! test -d "$path"; }; then echo "Site $child must be a real directory." >&2; exit 1; fi
done
if ! test -e "$site_root/releases"; then install -d -m 0755 -o root -g root "$site_root/releases"; else chown -R root:root "$site_root/releases"; chmod 0755 "$site_root/releases"; fi
install -d -m 0700 -o "$user" -g "$group" "$site_root/incoming"
if test -L "$control_root" || { test -e "$control_root" && ! test -d "$control_root"; }; then echo 'Control root must be a real directory.' >&2; exit 1; fi
if ! test -e "$control_root"; then install -d -m 0700 -o root -g root "$control_root"; fi
test "$(stat -c %u "$control_root")" = 0 && test "$(stat -c %a "$control_root")" = 700 || { echo 'Control root must be root-owned 0700.' >&2; exit 1; }
if test -L "$site_root/current"; then chown -h root:root "$site_root/current"; elif test -e "$site_root/current"; then echo 'Existing current must be an atomic symlink before CD installation.' >&2; exit 1; fi
for directory in /usr/local/libexec /etc/caddy /etc/caddy/sites; do
  if test -L "$directory" || { test -e "$directory" && ! test -d "$directory"; }; then echo "Required host directory $directory must be a real directory." >&2; exit 1; fi
  if ! test -e "$directory"; then install -d -m 0755 -o root -g root "$directory"; fi
  test "$(stat -c %u "$directory")" = 0 && test "$(stat -c %a "$directory")" = 755 || { echo "Required host directory $directory must be root-owned 0755." >&2; exit 1; }
done
install -m 0755 -o root -g root "$source_dir/vireo-website-receiver.sh" /usr/local/libexec/vireo-website-receiver
install -m 0755 -o root -g root "$source_dir/vireo-website-controller.py" /usr/local/libexec/vireo-website-controller
# Never follow a deployment-user-controlled home, .ssh directory, or key file as
# root. Existing human and flagship keys are retained exactly as they are.
home=$(getent passwd "$user" | awk -F: 'NR==1 {print $6}')
test -n "$home" && test -d "$home" && test ! -L "$home" || { echo 'Deployment user home must be a real directory.' >&2; exit 1; }
test "$(stat -c %u "$home")" = "$(id -u "$user")" || { echo 'Deployment user home ownership is unsafe.' >&2; exit 1; }
ssh_dir="$home/.ssh"
if test -L "$ssh_dir" || { test -e "$ssh_dir" && ! test -d "$ssh_dir"; }; then echo 'Deployment .ssh must be a real directory.' >&2; exit 1; fi
if ! test -e "$ssh_dir"; then runuser -u "$user" -- mkdir -m 0700 "$ssh_dir"; fi
test "$(stat -c %u "$ssh_dir")" = "$(id -u "$user")" && test "$(stat -c %a "$ssh_dir")" = 700 || { echo 'Deployment .ssh ownership or mode is unsafe.' >&2; exit 1; }
auth="$ssh_dir/authorized_keys"
if test -L "$auth" || { test -e "$auth" && ! test -f "$auth"; }; then echo 'authorized_keys must be a real regular file.' >&2; exit 1; fi
key_value=$(cat "$key"); printf '%s\n' "$key_value" | grep -Eq '^ssh-ed25519 [A-Za-z0-9+/=]+([[:space:]][^[:cntrl:]]*)?$' || { echo 'Deployment key must be one ssh-ed25519 public-key line.' >&2; exit 1; }
entry="restrict,command=\"/usr/local/libexec/vireo-website-receiver\" $key_value"
# All writes below run as deploy. A malicious deployment user may change its own
# key file, but can never race root into following a symlink or changing another
# account's file. Existing human/flagship entries remain untouched.
if runuser -u "$user" -- sh -eu -c '
  auth=$1 entry=$2 key=$3
  test ! -L "$auth"
  if test ! -e "$auth"; then umask 077; : > "$auth"; chmod 0600 "$auth"; fi
  test -f "$auth" && test ! -L "$auth"
  if grep -Fqx "$entry" "$auth"; then exit 0; fi
  if grep -Fq "$key" "$auth" || grep -Fq '"'"'command="/usr/local/libexec/vireo-website-receiver"'"'"' "$auth"; then exit 65; fi
  printf "%s\\n" "$entry" >> "$auth"
' sh "$auth" "$entry" "$key_value"; then
  :
else
  code=$?
  if test "$code" = 65; then echo 'Existing website deployment key entry differs; inspect and resolve it manually.' >&2; else echo 'Could not safely install the deployment key.' >&2; fi
  exit 1
fi
test ! -L "$auth" && test -f "$auth" && test "$(stat -c %u "$auth")" = "$(id -u "$user")" && test "$(stat -c %a "$auth")" = 600 || { echo 'authorized_keys ownership or mode changed during installation.' >&2; exit 1; }
printf '%s ALL=(root) NOPASSWD: /usr/local/libexec/vireo-website-controller *\n' "$user" > /etc/sudoers.d/vireo-website-deploy
chmod 0440 /etc/sudoers.d/vireo-website-deploy; visudo -cf /etc/sudoers.d/vireo-website-deploy
target=/etc/caddy/sites/vireo-website.caddy; backup=$(mktemp /etc/caddy/.vireo-website.XXXXXX); had_target=false
if test -f "$target"; then cp -p "$target" "$backup"; had_target=true; fi
install -m 0644 -o root -g root "$source_dir/Caddyfile" "$target"
if ! caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile || ! systemctl reload caddy; then
  if test "$had_target" = true; then cp -p "$backup" "$target"; else rm -f "$target"; fi
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl reload caddy || true
  rm -f "$backup"; echo 'Caddy installation failed; prior site configuration was restored.' >&2; exit 1
fi
rm -f "$backup"
echo 'Installed forced-command website CD receiver; configure the protected GitHub environment before enabling deployment.'
