
if [ $# -ne 1 ]; then
    echo "Usage: $0 <tag>"
    exit 1
fi

TAG=$1

git pull origin main --tags

# Replace version into package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$TAG\"/" package.json

git add .
git commit -am "$TAG"
git tag -s v$TAG -m "$TAG"
git push origin main --tags


# exit 0
$SHELL