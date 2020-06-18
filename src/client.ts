import { createServer } from "http";

import { getParams } from "./get-params";
import { connectProxy } from "./connect-proxy";
import { hideUrl } from "./convert";

let { PROXY, SERVER, CLIENT } = getParams();

let client = createServer((req, res) => {
  connectProxy({
    port: PROXY.port,
    host: PROXY.host,
    auth: PROXY.auth,
    path: `http://${SERVER.host}:${SERVER.port}`
  })({ headers: hideUrl(req.headers, req.url as string), inRes: res });
});

client.listen(CLIENT.port, CLIENT.host, () => {
  console.log(`Started proxy client on ${CLIENT.port}.`);
});
