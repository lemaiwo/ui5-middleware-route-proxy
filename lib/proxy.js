const httpProxy = require('http-proxy');
const dotenv = require("dotenv");

module.exports = function ({
    resources,
    options
}) {
    const proxy = new httpProxy.createProxyServer( {secure:false} );
    const routing = options.configuration;


    // Call dotenv, so that contents in the file are stored in the environment variables
    dotenv.config();

    const env = {
        username: process.env.PROXY_USERNAME || process.env.proxy_username,
        password: process.env.PROXY_PASSWORD || process.env.proxy_password
    };

    return function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.header(200);
            if (routing.debug) {
                console.log(req.method + '(options): ' + req.url);
            }
            next();
            return;
        }
        var dirname = req.url.replace(/^\/([^\/]*).*$/, '$1'); //get root directory name eg sdk, app, sap
        if (!routing[dirname]) {
            if (routing.debug) {
                console.log(req.method + ': ' + req.url);
            }
            next();
            return;
        }
        if (routing.debug) {
            console.log(req.method + ' (redirect): ' + routing[dirname].target + req.url);
        }
        proxy.web(req, res, { target: routing[dirname].target, auth: env.username + ":" + env.password }, function (err) {
            if (err) {
                next(err);
            }
        });
    }
};