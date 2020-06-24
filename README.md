# simple-node-proxy

### Work Flow

```
  +----------+
  |   user   |
  +----+-----+
       |
       v
+------+--------+
|  node proxy   |
|    client     |
+------+--------+
       |
       v
+------+--------+
|   firewall    |
+------+--------+
       |
       |
       |
       |
       |
       v
+------+--------+
|  node proxy   |
|    server     |
+------+--------+
       |
       v
+------+--------+
|    proxy      |
+---------------+
```

### Example Config

```javascript
{
  "PROXY": {
    "host": "evil.corporate.proxy",
    "port": 8080,
    "auth": "username:password." // Basic Auth
  },
  "SERVER": {
    "host": "remote", // some vps server
    "port": 80, // or 443, if your proxy doesn't allow other ports. You can use nginx to forward port.
    "realPort": 7878 // real port nodejs is listening on
  },
  "CLIENT": {
    "host": "0.0.0.0", // this is your machine
    "port": 8787
  },
  "HTTPS": {
    "host": "0.0.0.0", // this is your machine. This HTTPS server is to generate fake Certificates
    "port": 8788
  }
}
```

### Run Client

```bash
node dist/index.js -c --config path/to/config
```
### Run Server

```bash
node dist/index.js -s --config path/to/config
```
