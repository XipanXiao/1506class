echo "Aggregating JavaScript files"

for deps in *.deps; do
    rm -f ${deps%.*}.js;
    for f in `cat $deps`; do cat $f >> ${deps%.*}.js; done;
    echo Created ${deps%.*}.js;
done;
ln -s v2/web/staff.html staff.html
ln -s v2/web report

#echo "RewriteEngine on" > .htaccess
#echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
#echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
