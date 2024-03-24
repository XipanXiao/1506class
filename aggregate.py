import os
from subprocess import check_output

print("Aggregating JavaScript files")

def copy_file(a, b):
    with open(a, "rb") as inFile:
        with open(b, "ab") as outFile:
            outFile.write(inFile.read())

for deps_file in os.listdir('.'):
    if deps_file.endswith('.deps'):
        js_file = os.path.splitext(deps_file)[0] + '.js'
        with open(deps_file, 'r') as infile:
            for line in infile:
                copy_file(line.strip(), js_file)

        print(f"Created {js_file}")
