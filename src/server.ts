import { createServer, ServerResponse } from "http";
import { request as httpsReq } from "https";
import { request as httpReq } from "http";
import { connect, Socket } from "net";
import { URL } from "url";

import { getParams } from "./get-params";

const HTTP_PROXY = process.env.http_proxy;
const HTTPS_PROXY = process.env.https_proxy;

let { SERVER } = getParams();

let server = createServer((inReq, inRes) => {
  let userHead = inReq.headers["inbound-head"];
  let userURL = inReq.headers["inbound-url"];
  if (userHead === undefined || userURL === undefined) {
    inRes.writeHead(200, { "Content-Type": "text/plain" });
    inRes.end("From Server");
    return;
  }
  let inSocket = inRes.socket;

  if (typeof HTTP_PROXY === "string") {
    let { hostname: proxyHost, port: proxyPort } = new URL(HTTP_PROXY);
    let proxyReq = httpReq({
      host: proxyHost,
      port: proxyPort,
      method: "CONNECT",
      path: `example.com:80`
    });
    proxyReq.end();
    proxyReq.on("connect", (proxyRes: ServerResponse, proxySocket: Socket) => {
      proxySocket.write(
        "GET / HTTP/1.1\r\n" +
          "Host: www.example.com:80\r\n" +
          "Connection: close\r\n" +
          "\r\n"
      );
      proxySocket.pipe(inSocket);
    });
  } else if (typeof HTTPS_PROXY) {
  } else {
    let outSocket = httpReq("http://example.com/", () => {
      //outSocket.write(Buffer.from(userHead as string, "base64"));
      outSocket.on("data", chunk => {
        console.log(chunk);
      });
      inSocket.pipe(outSocket);
      outSocket.pipe(inSocket);
    });
  }
});

server.listen(SERVER.realPort);
