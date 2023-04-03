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

const getConfigValue = (config, key) => {
  const value = config[key];
  if (value === undefined) {
    throw new Error(`Key is not found (reading '${key}')`);
  }
  return value;
};

module.exports.default = (compilation, config, options) => {
  configKey = 'resourcesOutputPath';
  try {
    const resourcesOutputPath = getConfigValue(options, configKey);
    let publicPath;
    configKey = 'publicPath';
    try {
      publicPath = getConfigValue(config, configKey);
    } catch (err) {
      configKey = 'baseHref';
      try {
        publicPath = getConfigValue(options, configKey);
      } catch (err) {
        configKey = 'deployUrl';
        publicPath = getConfigValue(options, configKey);
      }
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
    console.warn(`\nCannot find "${configKey}" key in options`);
    console.warn(err.message);
  }
}
