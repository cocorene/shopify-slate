module.exports = class Compiler {
  constructor(config) {
    const compiler = webpack(config);

    this.isFirstCompilation = true;
    this.assetsHashes = {};

    compiler.plugin('compile', _onCompilerCompile);
    compiler.plugin('done', _onCompilerDone);

    return compiler;
  }

  _onCompilerDone(stats) {
    const statsJson = stats.toJson({}, true);
    const messages = formatWebpackMessages(statsJson);

    if (messages.errors.length) {
      _onCompileError();
    } else if (messages.warnings.length) {
      _onCompilerWarnings();
    } else {
      _onCompileSuccess();
    }

    this.isFirstCompilation = false;
  }

  _onCompileSuccess() {}

  _onCompileError(messages) {
    if (!messages.errors.length) {
      return;
    }

    event('slate-tools:start:compile-errors', {
      errors: messages.errors,
      version: packageJson.version,
    });

    console.log(chalk.red('Failed to compile.\n'));
    console.log(config.paths.lib);
    messages.errors.forEach(message => {
      console.log(`${message}\n`);
    });
  }

  _onCompileWarnings(messages) {
    event('slate-tools:start:compile-warnings', {
      duration: statsJson.time,
      warnings: messages.warnings,
      version: packageJson.version,
    });

    console.log(chalk.yellow('Compiled with warnings.\n'));
    messages.warnings.forEach(message => {
      console.log(`${message}\n`);
    });
  }

  getFilesFromAssets(stats) {
    const assets = stats.compilation.assets;
    let files = [];

    Object.keys(assets).forEach(key => {
      if (key === 'static.js') {
        return;
      }

      const asset = assets[key];

      if (asset.emitted && fs.existsSync(asset.existsAt)) {
        if (key === 'scripts.js') {
          const assetHash = stats.compilation.chunks[0].hash;

          if (!assetsHash[key] || assetsHash[key] !== assetHash) {
            files = [...files, asset.existsAt.replace(config.paths.dist, '')];
            assetsHash[key] = assetHash;
          }
        } else {
          const source = asset.source();
          const assetSource = Array.isArray(source)
            ? source.join('\n')
            : source;
          const assetHash = createHash('sha256')
            .update(assetSource)
            .digest('hex');

          // new file, or existing one that changed
          if (!assetsHash[key] || assetsHash[key] !== assetHash) {
            files = [...files, asset.existsAt.replace(config.paths.dist, '')];
            assetsHash[key] = assetHash;
          }
        }
      }
    });

    return files;
  }
};
