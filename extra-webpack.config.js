const { Compilation, sources } = require('webpack');
const { merge } = require("webpack-merge");
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;
const fs = require('fs');
//const path = require('path');

const angular_json_fn = './angular.json';

const getAsset = (compilation, name) => {
  // New API
  if (compilation.getAsset) {
    return compilation.getAsset(name);
  }

  if (compilation.assets[name]) {
    return { name, source: compilation.assets[name], info: {} };
  }
};

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  /*
  singleSpaWebpackConfig.module.rules.push({
    test: /\.?(css|scss|sass|less|styl)$/i,
//    use: [{
//      loader: './style_loader.js',
//      options: {
//        esModule: false
//      }
//    }],
    loader: './style_loader.js',
  });
  */
  //console.log(singleSpaWebpackConfig.module.rules);

//  return singleSpaWebpackConfig;
  return merge(singleSpaWebpackConfig, {
    //module: {
    //  rules: [ ...singleSpaWebpackConfig.module.rules ]
    //},
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.thisCompilation.tap('compilationPlugin',
                                             (compilation) => {

            const npm_package_name = process.env['npm_package_name'];
            if (!npm_package_name) {
              console.warn(
                '\nCannot get environment variable "npm_package_name"'
              );
            } else {
              fs.readFile(angular_json_fn, 'utf8', (err, data) => {
                if (err) {
                  console.warn(`\nCannot read "${angular_json_fn}" file:`);
                  console.warn(err);
                } else {
                  const angular_config = JSON.parse(data);
                  try {
                    const resourcesOutputPath
                      = angular_config.projects[npm_package_name].architect
                                      .build.options.resourcesOutputPath;
                    if (!resourcesOutputPath) {
                      throw new Error(
                        "Key is not found (reading 'resourcesOutputPath')"
                      );
                    }
                    compilation.hooks.processAssets.tap({
                      name: 'Replace',
                      stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                    }, () => {
                      console.log('\n=== Compilation hook starts... ===');
                      const outputPath = compilation.outputOptions.path;
                      const publicPath = compilation.outputOptions.publicPath;
                      const searchString = resourcesOutputPath;
                      const replaceString = publicPath + (
                          publicPath.endsWith('/') ? searchString.substring(1)
                                                   : searchString
                      );
                      const emittedAssets = compilation.getAssets()
                                                       .map((a) => a.name);
                      emittedAssets.forEach((fn) => {
                        if (fn.endsWith('js')) {
                          console.log(`=== processing file "${fn}"`);
                          try {
                            const {
                              source: inputSource, info
                            } = getAsset(compilation, fn);
                            src = inputSource.source();
                            src = src.replaceAll(searchString, replaceString);
                            compilation.updateAsset(
                              fn, new sources.RawSource(src), info
                            );
                            console.log('=== Compilation hook done. ===');
                          } catch (err) {
                            console.warn(`Cannot collect js asset "${fn}":`);
                            console.warn(err.message);
                            console.warn('=== Compilation hook aborted. ===');
                          }
                        }
                      });
                    });
                  } catch (err) {
                     console.warn('\nCannot find "angular_config.projects'
                               + `['${npm_package_name}'].architect.build`
                               + '.options.resourcesOutputPath" key in '
                               + `"${angular_json_fn}" file:`);
                     console.warn(err.message);
                  }
                }
              });
            }

          });

          /*
          compiler.hooks.done.tap('postprocessing', (stats) => {
            if (stats.compilation.options.mode === 'production') {
              const outputPath = stats.compilation.outputOptions.path;
              const publicPath = stats.compilation.outputOptions.publicPath;
              const searchString = '/assets/misc/';
              const replaceString = publicPath + (
                  publicPath.endsWith('/') ? searchString.substring(1)
                                           : searchString
              );
              Object.keys(stats.compilation.assets).forEach((fn) => {
                if (!fn.startsWith('/assets') && fn.endsWith('.js')) {
                  fn = path.join(outputPath, fn);
                  console.log('\n=== Postprocessing hook starts... ===');
                  fs.readFile(fn, 'utf8', (err, data) => {
                    if (err) {
                      console.error(err);
                    }
                    else {
                      fs.writeFile(fn, data.replaceAll(searchString,
                                                       replaceString), 'utf8', err => {
                        if (err) {
                          console.error(err);
                        }
                        console.log('=== Postprocessing hook done. ===');
                      });
                    }
                  });
                }
              });
            }
          });
          */
        }
      }
    ],
  });
};
