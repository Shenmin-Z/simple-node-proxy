import { createServer } from "http";
import { request as httpsReq } from "https";
import { request as httpReq } from "http";
import { connect, Socket } from "net";
import { URL } from "url";

import { getParams } from "./get-params";
import { connectProxy } from "./connect-proxy";
import { getUrl } from "./convert";

const HTTP_PROXY = process.env.http_proxy;
const HTTPS_PROXY = process.env.https_proxy;

let { SERVER } = getParams();

let server = createServer((inReq, inRes) => {
  if (typeof HTTP_PROXY === "string") {
    let { hostname: proxyHost, port: proxyPort } = new URL(HTTP_PROXY);
    connectProxy({
      port: parseInt(proxyPort),
      host: proxyHost,
      path: getUrl(inReq.headers)
    })({ headers: inReq.headers, inRes });
  } else if (typeof HTTPS_PROXY) {
  } else {
  }
});

server.listen(SERVER.realPort, "0.0.0.0");
