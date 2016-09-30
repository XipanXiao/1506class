echo "Aggregating JavaScript files"
rm -f admin.js
for f in `cat admin.deps`; do cat $f >> admin.js; done;
rm -f index.js
for f in `cat index.deps`; do cat $f >> index.js; done;
rm -f local.js
for f in `cat local.deps`; do cat $f >> local.js; done;
echo "RewriteEngine on" > .htaccess
echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
