#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
SOURCE_FOLDER="target/dist"
TARGET_FOLDER="target/pages"

function doCompile {
  npm i
  bower i
  grunt dist
}

# Save some useful information
REPO=`git config remote.origin.url`
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into target/pages/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
rm -rf $TARGET_FOLDER
git clone $REPO $TARGET_FOLDER
cd $TARGET_FOLDER
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ../..

# Clean out existing contents
rm -rf $TARGET_FOLDER/* || exit 0

# Run our compile script
doCompile

# Copy generated files to target/pages:
cp -r $SOURCE_FOLDER/* $TARGET_FOLDER/

# Now let's go have some fun with the cloned repo
cd $TARGET_FOLDER

# Commit the "changes", i.e. the new version.

# If there are no changes to the compiled out (e.g. this is a README update) then just bail.
if [ -z `git diff --exit-code` ]; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

# The delta will show diffs between new and old versions.
git add .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Now that we're all set up, we can push.
git push $TARGET_BRANCH
