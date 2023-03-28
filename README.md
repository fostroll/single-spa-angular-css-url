# single-spa-angular-css-url

This is just reminder for internal use, because the task (processing CSS files
with url(&lt;asset path&gt;) directive in single-spa Angular applications) is not yet clarified
in the documentation. Or I simply couldn't find the solution.

While handling Angular assets in JS and HTML files described in the official
*[documentation]([URL]https://single-spa.js.org/docs/ecosystem-angular.html#angular-assets)*,
the task of processing CSS files referring assets with url(&lt;asset path&gt;)
directive is not yet clarified. Or I simply couldn't find the solution.

1. angular.json

Add **resourcesOutputPath** to the
`projects[<project name>].architect.build.options`. For example:
```json
"resourcesOutputPath": "/assets/misc",
"assets": [
  "src/favicon.ico",
  "src/assets"
],
```
It allows all the assets which are not located in the `assets` paths to be
moved into `/assets/misc` directory.

2. extra-webpack.config.js

You need to add compilation hook provided in "extra-webpack.config.js" file in
this repo.
