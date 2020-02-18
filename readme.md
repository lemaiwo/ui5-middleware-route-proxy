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
  used to match and forward requests to your server
  - target: `string`
    hostname of your backend server
  - auth: `object`
    authorization object with username and password
    - user: `string`
    - pass: `string` 
  
Example:
```yml
      debug: true
      sap: 
        target: http(s)://host:port
        auth:
          user: Username
          pass: Password!
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
      routeRootPath: 
        target: http(s)://host:port
        auth:
          user: Username
          pass: Password!
```
