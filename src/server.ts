import { createServer } from "http";
import { URL } from "url";

import { getParams } from "./get-params";
import { makeRequest } from "./connect-proxy";
import { getUrl } from "./convert";
import { filterHeader } from "./utils";

const HTTP_PROXY = process.env.http_proxy;
const HTTPS_PROXY = process.env.https_proxy;

let { SERVER } = getParams();

let server = createServer((inReq, inRes) => {
  let headers = filterHeader(inReq.headers, ["x-mwg-via"]);
  let path = getUrl(inReq.headers);

  if (SERVER.proxy) {
    let serverProxy;
    if (SERVER.proxy.toLowerCase() === "true") {
      serverProxy = HTTP_PROXY || (HTTPS_PROXY as string);
    } else {
      serverProxy = SERVER.proxy;
    }
    let { hostname: proxyHost, port: proxyPort } = new URL(serverProxy);
    makeRequest({
      port: parseInt(proxyPort),
      host: proxyHost,
      path
    })({ headers, inRes, inReq });
  } else {
    makeRequest({
      path
    })({ headers, inRes, inReq });
  }
});

server.listen(SERVER.realPort, "0.0.0.0");
