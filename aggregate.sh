rm admin.js
for f in `cat admin.deps`; do cat $f >> admin.js; done;
rm index.js
for f in `cat index.deps`; do cat $f >> index.js; done;

