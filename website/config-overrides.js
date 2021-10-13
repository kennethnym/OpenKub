// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactRefresh = require('@pmmmwh/react-refresh-webpack-plugin');

// Credit to react-app-rewire-hot-loader
// https://github.com/cdharris/react-app-rewire-hot-loader/blob/master/index.js
function findBabelLoader(config) {
	// Filtering out rules that don't define babel plugins.
	const babelLoaderFilter = (rule) =>
		rule.loader &&
		rule.loader.includes('babel') &&
		rule.options &&
		rule.options.plugins;

	// First, try to find the babel loader inside the oneOf array.
	// This is where we can find it when working with react-scripts@2.0.3.
	let loaders = config.module.rules.find((rule) =>
		Array.isArray(rule.oneOf)
	).oneOf;

	let babelLoader = loaders.find(babelLoaderFilter);

	// If the loader was not found, try to find it inside of the "use" array, within the rules.
	// This should work when dealing with react-scripts@2.0.0.next.* versions.
	if (!babelLoader) {
		loaders = loaders.reduce((ldrs, rule) => ldrs.concat(rule.use || []), []);
		babelLoader = loaders.find(babelLoaderFilter);
	}
	return babelLoader;
}

// override default creact-react-app webpack config
function override(config, env) {
	if (env === 'development') {
		config.plugins.push(new ReactRefresh());
		findBabelLoader(config).options.plugins.push(
			require.resolve('react-refresh/babel')
		);
	}

	return config;
}

module.exports = override;
