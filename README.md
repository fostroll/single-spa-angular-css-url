# single-spa-angular-css-url

Although the handle of Angular assets in JS and HTML files is described in the
official
*[documentation](https://single-spa.js.org/docs/ecosystem-angular.html#angular-assets)*
(***note*** that you **must** use deprecated key `deployUrl` in
`architect.build.options` in order to implement it),
the task of processing CSS files that refer to assets using `url(<asset path>)`
directive is not yet clarified. Or I simply couldn't find the solution.

By default, the asset references in CSS files that contain relative paths
continue to point on those relative paths when they are used in the host
application. Obviosly, this ends up in an error, because the host application
doesn't contain the required assets.

**The goal**: links from CSS files after compilation must contain absolute
path to assets, including FQDN of the microfrontend that exposes the
corresponding assets. It should work in both production mode and development
mode with live reload.

## Solution

So far, the only way I've found to solve the problem is by writing a small
webpack compilation hook. Fist of all, we move all of our CSS assets to a
specific directory, and then we add FQDN of the microfrontend to that
directory's path in the final bundle.

### angular.json

Add **resourcesOutputPath** to the
`projects[<project name>].architect.build.options`. For example:
```json
"resourcesOutputPath": "/assets/misc",
"assets": [
  "src/favicon.ico",
  "src/assets"
],
```
It allows all assets that are not in the `assets` paths to be moved to the
`/assets/misc` directory.

### extra-webpack.config.js

You need to add compilation hook provided in `extra-webpack.config.js` file
in this repo (requires `webpack.compilation_plugin.js` which is also provided).
