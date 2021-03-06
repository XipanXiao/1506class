echo "Aggregating JavaScript files"

for deps in *.deps; do
    rm -f ${deps%.*}.js;
    for f in `cat $deps`; do cat $f >> ${deps%.*}.js; done;
    echo Created ${deps%.*}.js;
done;

cd report;
rm index.html;  ln -s ../v2/web/index.html index.html;
rm styles2.css; ln -s ../styles2.css styles2.css;


#echo "RewriteEngine on" > .htaccess
#echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
#echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
