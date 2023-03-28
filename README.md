# single-spa-angular-css-url

This is just reminder for internal use, because the task (processing CSS files
with `url(<asset path>)` directive in single-spa Angular applications) is not
yet clarified in the documentation. Or I simply couldn't find the solution.

While handling Angular assets in JS and HTML files described in the official
*[documentation](https://single-spa.js.org/docs/ecosystem-angular.html#angular-assets)*,
the task of processing CSS files referring assets with `url(<asset path>)`
directive is not yet clarified. Or I simply couldn't find the solution.

By default, assets referrals in CSS files that contains relative paths continue
show those relative paths while using in the host application. Obviosly, it
ends up with error, because host application doesn't contain the assets needed.

**The goal**: links from CSS files after compilation should contain absolute
path of the assets including FQDN of the microfrontend which expose the
corresponding assets. It must work in both: production mode and development
mode with live reload.

## Solution

Until now, I found the only way to solve the task by writing a small webpack
compilation hook. Primary, we move all our assets to the particular directory,
and then adding FQDN of the microfrontend to the path of that directory in the
final bundle.

## angular.json

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

## extra-webpack.config.js

You need to add compilation hook provided in `extra-webpack.config.js` file in
this repo.
