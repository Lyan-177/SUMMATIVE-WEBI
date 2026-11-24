# MEDSAFE : Medication safety lookup 

MEDSAFE lets anyone search a medication by brand or generic name 

- 
-
-

Feautures 
- search by brand or generic drug name
- filter results by text and sort by name or manufacturer
- boxed warning flag on high-risk products
- error handling invlid input, no result, fda service down
- api key kept on the server in `.env` 

API used 
openfda drug label api : https//open.fda/apis/drug/label

Run locally 
git clone https://github.com/Lyan-177/SUMMATIVE-WEBI.git
cd SUMMATIVE-WEBI
npm install 
cp .env.example .env
npm start

deployment (web-01 and web-02)
 sudo apt update && sudo apt install -y git nginx nodejs npm
 git clone https://github.com/Lyan-177/SUMMATIVE-WEBI.git app
 npm install
 printf "OPENFDA_API_KEY=YOOUR_KEY\nPORT=3000\n 
Load balancer
nginx round-robin in `/etc/nginx/sites-available/default` :
upstream medasafe_backend {
    zone medsafe_backend 64k;
    server web-01:80;
    server web-02:80;
}
server {
    listen 80 default_server ;
    location / {
        proxy_pass http://medsafe_backend; 
    }
    
}