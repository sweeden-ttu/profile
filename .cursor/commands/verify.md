# verify

Runs all necessary tasks to verify the site build.

1. Runs `jekyll build` to build the site and checks for build errors.
2. Runs `jekyll serve` in the background.
3. Checks if the home page (`http://localhost:4000` by default) is accessible and appears as expected.

Use this to ensure the Jekyll site builds and serves successfully.

This command will be available in chat with /verify
