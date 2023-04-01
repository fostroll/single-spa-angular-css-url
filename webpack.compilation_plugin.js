const { Compilation, sources } = require('webpack');

const getAsset = (compilation, name) => {
  // New API
  if (compilation.getAsset) {
    return compilation.getAsset(name);
  }

  if (compilation.assets[name]) {
    return { name, source: compilation.assets[name], info: {} };
  }
};

module.exports.default = (compilation, options) => {
  configKey = 'resourcesOutputPath';
  try {
    const resourcesOutputPath = options[configKey]
    configKey = 'deployUrl';
    let publicPath;
    try {
      publicPath = options[configKey];
    } catch (err) {
      configKey = 'baseHref';
      publicPath = options[configKey];
    }

    compilation.hooks.processAssets.tap({
      name: 'Replace',
      stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
    }, () => {
      console.log('\n=== Compilation hook starts... ===');
      const replaceString = publicPath + (
          publicPath.endsWith('/') ? resourcesOutputPath
                                       .substring(1)
                                   : resourcesOutputPath
      );
      const emittedAssets = compilation.getAssets()
                                       .map((a) => a.name);
      let fn;
      try {
        emittedAssets.forEach((fn_) => {
          fn = fn_;
          if (fn.endsWith('.js') || fn.endsWith('.css')) {
            console.log(`=== processing file "${fn}"`);
            const {
              source: inputSource, info
            } = getAsset(compilation, fn);
            const src = inputSource.source().replaceAll(
              resourcesOutputPath, replaceString
            );
            compilation.updateAsset(
              fn, new sources.RawSource(src), info
            );
          }
        });
        console.log('=== Compilation hook done. ===');
      } catch (err) {
        console.warn(`Cannot collect js asset "${fn}":`);
        console.warn(err.message);
        console.warn('=== Compilation hook aborted. ===');
      }
    });
    
  } catch (err) {
    console.warn('\nCannot find "angular_config.projects'
              + `['${angularProject}'].architect.build`
              + `.options.${configKey}" key in `
              + `"${angularJsonFn}" file:`);
    console.warn(err.message);
  }
}
