const { Compilation, sources } = require('webpack');
const fs = require('fs');

const ANGULAR_JSON_FN = './angular.json';
const ANGULAR_PROJECT_ENV = 'ANGULAR_PROJECT';

const angularJsonFn = './angular.json';

const getAsset = (compilation, name) => {
  // New API
  if (compilation.getAsset) {
    return compilation.getAsset(name);
  }

  if (compilation.assets[name]) {
    return { name, source: compilation.assets[name], info: {} };
  }
};

const getConfigValue = (config, project, key) => {
  const value = config.projects[project].architect.build.options[key];
  if (!value) {
    throw new Error(`Key is not found (reading '${key}')`);
  }
  return value;
};

module.exports.default = (compilation) => {
  const angularProject = process.env[ANGULAR_PROJECT_ENV];
  if (!angularProject) {
    console.warn(
      `\nCannot get environment variable "${ANGULAR_PROJECT_ENV}"`
    );
  } else {
    fs.readFile(angularJsonFn, 'utf8', (err, data) => {
      if (err) {
        console.warn(`\nCannot read "${angularJsonFn}" file:`);
        console.warn(err);
      } else {
        const angularConfig = JSON.parse(data);
        let configKey = 'resourcesOutputPath';
        try {
          const resourcesOutputPath = getConfigValue(
            angularConfig, angularProject, configKey
          );
          configKey = 'deployUrl';
          const deployUrl = getConfigValue(
            angularConfig, angularProject, configKey
          );
          compilation.hooks.processAssets.tap({
            name: 'Replace',
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
          }, () => {
            console.log('\n=== Compilation hook starts... ===');
            const replaceString = deployUrl + (
                deployUrl.endsWith('/') ? resourcesOutputPath
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
    });
  }
}
