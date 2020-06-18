import {
  createServer,
  request,
  IncomingMessage,
  ServerResponse,
  RequestOptions
} from "http";
import { Socket } from "net";
import { URL } from "url";

import { getParams } from "./get-params";

let { PROXY, SERVER, CLIENT } = getParams();

let client = createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("I'm a proxy.");
});

client.on(
  "connect",
  (inReq: IncomingMessage, inSocket: Socket, userHead: Buffer) => {
    let { port: userPort, host: userHost } = new URL(`http://${inReq.url}`);
    let options: RequestOptions = {
      host: PROXY.host,
      port: PROXY.port,
      method: "CONNECT",
      path: `${SERVER.host}:${SERVER.port}`
    };
    if (typeof PROXY.auth === "string") {
      options.headers = {
        "Proxy-Authorization": `Basic ${Buffer.from(PROXY.auth).toString(
          "base64"
        )}`
      };
    }
    let outReq = request(options);
    outReq.end();

    outReq.on(
      "connect",
      (outRes: ServerResponse, outSocket: Socket, outHead: Buffer) => {
        inSocket.write(
          "HTTP/1.1 200 Connection Established\r\n" +
            "Proxy-agent: Node.js-Simple Proxy\r\n" +
            "\r\n"
        );
        outSocket.write(
          "GET / HTTP/1.1\r\n" +
            `HOST: ${userHost}:${userPort}\r\n` +
            `Inbound-URL: ${inReq.url}\r\n` +
            `Inbound-Head: ${userHead.toString("base64")}\r\n` +
            "Connection: close\r\n" +
            "\r\n"
        );
        //inSocket.pipe(outSocket)
        outSocket.pipe(inSocket);
      }
    );
  }
);

client.listen(CLIENT.port, CLIENT.host, () => {
  console.log(`Started proxy on ${CLIENT.port}.`);
});
