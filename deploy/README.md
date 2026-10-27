# HTTPS deployment

The development and production stacks use separate Nginx templates and
certificates. Nginx terminates TLS; its connections to the app containers remain
inside the Docker network. The API stays on the same origin under `/api/`.

## Development

Install `mkcert` on the development machine, then create and trust a local
certificate:

```bash
./deploy/generate-dev-cert.sh
docker compose --env-file .env -f deploy/docker-compose.dev.yml up -d --build
```

Open the storefront at `https://localhost` and the admin at
`https://localhost/dashboard/`. Port `80` redirects to HTTPS on port `443`. The local
certificate and private key live under `deploy/certs/dev/`, which Git ignores.
Run `mkcert -install` in each browser/OS environment that needs to trust the
local certificate.

## Production by public IP

Use a stable, globally reachable public IP. Open inbound TCP ports 80 and 443
in the server firewall/security group. Add these non-secret settings to the
repository root `.env` file:

```dotenv
APP_PUBLIC_IP=203.0.113.10
CERTBOT_EMAIL=ops@example.com
```

Replace the example values with the server's public IP and an email address.
The email receives certificate expiry and account notices. Do not put a private
LAN address here.

Start the HTTP stack, request the short-lived IP certificate, then enable the
HTTPS Compose overlay:

```bash
./deploy/issue-prod-certificate.sh
```

The script starts the normal production stack on port 80 so Let's Encrypt can
validate `/.well-known/acme-challenge/`, obtains the certificate with Certbot,
then enables port 443 and redirects other HTTP requests to HTTPS. Visit
`https://<server-public-ip>/` and `https://<server-public-ip>/dashboard/`.

IP certificates are valid for about 160 hours, so install a daily renewal job.
For example, add this to root's crontab after HTTPS is up:

```cron
17 3 * * * /absolute/path/to/viberstore/deploy/renew-prod-certificate.sh >> /var/log/viberstore-certbot.log 2>&1
```

The renewal script asks Certbot to renew certificates when due, then reloads
Nginx so it reads the renewed files. Test the job once manually before relying
on the schedule:

```bash
./deploy/renew-prod-certificate.sh
```

The Let's Encrypt IP certificate flow requires a recent Certbot (5.4 or newer
for its webroot IP support). The Compose file uses the official Certbot 5.5.0
image. Nginx and Certbot share persistent certificate storage; do not commit
certificates or private keys.

## Local HTTP stack

The root `docker-compose.yml` remains an HTTP-only convenience stack. Use the
deployment Compose files above when you need separate dev/prod HTTPS behavior.
