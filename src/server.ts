import { createServer, IncomingMessage } from "http";
import { URL } from "url";

import { getParams } from "./get-params";
import { connectProxy } from "./connect-proxy";
import { getUrl } from "./convert";

const HTTP_PROXY = process.env.http_proxy;
const HTTPS_PROXY = process.env.https_proxy;

let { SERVER } = getParams();

let server = createServer((inReq, inRes) => {
  let headers = filterHeader(inReq.headers, ["x-mwg-via"]);
  if (typeof HTTP_PROXY === "string") {
    let { hostname: proxyHost, port: proxyPort } = new URL(HTTP_PROXY);
    connectProxy({
      port: parseInt(proxyPort),
      host: proxyHost,
      path: getUrl(inReq.headers)
    })({ headers, inRes });
  } else if (typeof HTTPS_PROXY) {
  } else {
  }
});

let filterHeader = (header: IncomingMessage["headers"], list: string[]) => {
  let res: IncomingMessage["headers"] = {};
  let llist = list.map(i => i.toLowerCase());
  Object.entries(header).forEach(([key, value]) => {
    if (!llist.includes(key)) {
      res[key] = value;
    }
  });
  return res;
};

server.listen(SERVER.realPort, "0.0.0.0");
