# QUALITY MARKET — DOMAIN + EMAIL SETUP

## Główna domena
- https://quality-market.com
- https://www.quality-market.com

## Subdomeny
- https://api.quality-market.com
- https://app.quality-market.com
- https://panel.quality-market.com
- https://cdn.quality-market.com

## Maile
- kontakt@quality-market.com
- support@quality-market.com
- sprzedaz@quality-market.com
- partnerzy@quality-market.com
- billing@quality-market.com
- admin@quality-market.com
- noreply@quality-market.com

## ENV
```env
NEXT_PUBLIC_APP_URL=https://quality-market.com
NEXT_PUBLIC_WWW_URL=https://www.quality-market.com
NEXT_PUBLIC_API_URL=https://api.quality-market.com
NEXT_PUBLIC_PANEL_URL=https://panel.quality-market.com

APP_URL=https://quality-market.com
WWW_URL=https://www.quality-market.com
API_URL=https://api.quality-market.com
PANEL_URL=https://panel.quality-market.com

MAIL_FROM=noreply@quality-market.com
MAIL_SUPPORT=support@quality-market.com
MAIL_CONTACT=kontakt@quality-market.com
MAIL_SALES=sprzedaz@quality-market.com
MAIL_PARTNERS=partnerzy@quality-market.com
MAIL_BILLING=billing@quality-market.com
MAIL_ADMIN=admin@quality-market.com
```

## DNS
```txt
A       @       YOUR_SERVER_IP
A       www     YOUR_SERVER_IP
A       api     YOUR_SERVER_IP
A       app     YOUR_SERVER_IP
A       panel   YOUR_SERVER_IP
CNAME   cdn     YOUR_CDN_TARGET
MX      @       YOUR_MAIL_PROVIDER_PRIORITY_10
TXT     @       v=spf1 include:YOUR_MAIL_PROVIDER ~all
TXT     default._domainkey   YOUR_DKIM_RECORD
TXT     _dmarc  v=DMARC1; p=none; rua=mailto:admin@quality-market.com
```

## Reverse proxy
- quality-market.com -> frontend
- www.quality-market.com -> frontend
- api.quality-market.com -> backend API
- panel.quality-market.com -> seller dashboard

## Deployment order
1. Podpiąć domenę i DNS
2. Wgrać cert SSL
3. Ustawić ENV z tej listy
4. Przepiąć frontend na quality-market.com
5. Przepiąć backend na api.quality-market.com
6. Przepiąć panel na panel.quality-market.com
7. Ustawić skrzynki mailowe
8. Odpalić live

## Minimum do startu
- domena: quality-market.com
- sklep: quality-market.com
- api: api.quality-market.com
- panel: panel.quality-market.com
- mail nadawcy: noreply@quality-market.com
- support: support@quality-market.com
