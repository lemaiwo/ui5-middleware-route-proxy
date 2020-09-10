# UI5 proxy middleware using routes

Middleware for [ui5-server](https://github.com/SAP/ui5-server), enabling proxy support.

## Install

```bash
npm install ui5-middleware-route-proxy --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `boolean`
  enable logging
- root directory of the request uri: `object`
  used to match and forward requests to your server. Needs to include the leading slash  character (`/`).
  - target: `string`
    hostname of your backend server
  - replacePath: `string` optional. If the request path needs to be modified by taking out the root directory uri
  - auth: `object`
    authorization object with username and password
    - user: `string`
    - pass: `string` 
    - client: `string` optional. If the client is not the default client on the SAP system
    - header: `string` optional. If given, the value is used as value for the `Authorization` header. `user` and `pass` values are not used in this case.
  - changeOrigin: `boolean` optional. If provided, the value will be added to the [options of the http-proxy](https://www.npmjs.com/package/http-proxy#options).
  
Each `boolean` or `string` field in a root path object can either represent the actual value or the name of a parameter in a .env file. 

Example:
```yml
      debug: true
      /sap: 
        target: http(s)://host:port
        replacePath: true
        auth:
          user: Username
          pass: Password!
          client: 100   
```

Example with target/user/pass in .env file:
```yaml
      debug: true
      /sap: 
        target: PROXY_TARGET
        auth:
          user: PROXY_USERNAME
          pass: PROXY_PASSWORD
```

Example with target and dedicated `Authorization` header in .env file:
```yaml
      debug: true
      /sap: 
        target: PROXY_TARGET
        auth:
          header: PROXY_AUTHORIZATION
        changeOrigin: true
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-middleware-route-proxy": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-middleware-route-proxy",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-route-proxy
    afterMiddleware: compression
    configuration:
      debug: true
      /routeRootPath: 
        target: PROXY_TARGET
        auth:
          user: PROXY_USERNAME
          pass: PROXY_PASSWORD
```

3. Add a `.env` file with your target, username and password for the proxy:

```yaml
PROXY_TARGET=<http(s)://host:port>
PROXY_USERNAME=<username>
PROXY_PASSWORD=<password>
```
