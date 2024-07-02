
if [ $# -ne 1 ]; then
    echo "Usage: $0 <tag>"
    exit 1
fi

TAG=$1

# Replace version into package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$TAG\"/" package.json

git add .
git commit -am "$TAG"
git tag v$TAG
git push origin master --tags

# exit 0
# $SHELL