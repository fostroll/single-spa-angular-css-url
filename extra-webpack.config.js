const { merge } = require("webpack-merge");
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;
const webpackCompilationPlugin = require('./webpack.compilation_plugin.js').default;
//const fs = require('fs');
//const path = require('path');

module.exports = (config, options) => {
  const config_ = singleSpaAngularWebpack(config, options);

  /*
  config_.module.rules.push({
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

//  return config_;
  return merge(config_, {
    //module: {
    //  rules: [ ...config_.module.rules ]
    //},
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.thisCompilation.tap(
            'compilationPlugin',
            (compilation) => webpackCompilationPlugin(compilation,
                                                      config, options)
          );

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
