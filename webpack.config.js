const webpack = require("@nativescript/webpack");
const webpackLib = require("webpack");

module.exports = (env) => {
	webpack.init(env);

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	webpack.chainWebpack((config) => {
		config.resolve.set('fallback', {
			...config.resolve.get('fallback'),
			"util": require.resolve("util/"),
			"crypto": false
		});

		// Provide process.env for Node.js polyfills
		config.plugin('define-process').use(webpackLib.DefinePlugin, [{
			'process.env': JSON.stringify({})
		}]);
	});

	return webpack.resolveConfig();
};


