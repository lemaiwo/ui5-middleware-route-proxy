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

    return function (req, res, next) {
        if (req.header) {
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
        }
        
        // Check whether to intercept the call
        var dirname = Object.keys(routing).filter(sPath => req.url.startsWith(sPath))

        if (dirname.length === 0 || !routing[dirname[0]]) {
            if (routing.debug) {
                console.log(req.method + ': ' + req.url);
            }
            next();
            return;
        }

        dirname = dirname[0];
        // Adjust if we need to replace the path
        req.url = (routing[dirname].replacePath) ? req.url.replace(dirname, "") : req.url

        // Adjust if we need to add a client
         if (routing[dirname].auth.client && req.url.indexOf("sap-client") === -1){
            
            var client = (req.url.indexOf("?") > -1) ? "&" : "?";
            client += "sap-client=" +routing[dirname].auth.client;
            req.url = req.url + client;
        }

        let proxyOptions = {};
        
        //get target
        let envOrDirectTarget; 
        envOrDirectTarget = process.env[routing[dirname].target] || routing[dirname].target;
        if (routing.debug) {            
            console.log(req.method + ' (redirect): ' + envOrDirectTarget + req.url);
        }
        proxyOptions.target = envOrDirectTarget;

        //get specific auth for given service
        if(routing[dirname].auth){
            let header   = process.env[routing[dirname].auth.header] || routing[dirname].auth.header;
                username = process.env[routing[dirname].auth.user]   || routing[dirname].auth.user;
                password = process.env[routing[dirname].auth.pass]   || routing[dirname].auth.pass;
            if(header){
                proxyOptions.headers = { Authorization: header };
                if (routing.debug) {            
                    console.log(req.method + ' (redirect): Using dedicated Authorization Header');
                }
            }else{
                proxyOptions.auth = username + ":" + password;
                if (routing.debug) {            
                    console.log(req.method + ' (redirect): Using user & pass for BasicAuthentication');
                }
            }
        }

        // additional proxy settings
        let changeOrigin = process.env[routing[dirname].auth.changeOrigin] || routing[dirname].changeOrigin;
        if(changeOrigin){
            proxyOptions.changeOrigin = changeOrigin;
        }

        proxy.web(req, res, proxyOptions, function (err) {
            if (err) {
                next(err);
            }
        });
    }
};
