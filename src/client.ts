import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse
} from "http";
import { createServer as createHttpsServer } from "https";
import { Socket, connect } from "net";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createSecureContext } from "tls";

import { getParams } from "./get-params";
import { makeRequest } from "./connect-proxy";
import { hideUrl } from "./convert";
import { generateCertificate } from "./generate-certificate";

let { PROXY, SERVER, CLIENT, HTTPS } = getParams();

let handler = (req: IncomingMessage, res: ServerResponse) => {
  let url = req.url as string;
  // TODO
  // I've not seen this documented anywhere :(
  let httpsServerName = (req as any).client?.servername || "";
  if (httpsServerName) {
    url = `https://${httpsServerName}${url}`;
  }
  makeRequest({
    port: PROXY.port,
    host: PROXY.host,
    auth: PROXY.auth,
    path: `http://${SERVER.host}:${SERVER.port}`
  })({ headers: hideUrl(req.headers, url), inRes: res });
};

/******************** 1. HTTP ********************/
let httpClient = createHttpServer(handler);

/******************** 2. HTTPS ********************/
let sharedKey = readFileSync(resolve(process.cwd(), "myCA/myDev.key"));
let fakeCrtPool: { [s: string]: Buffer } = {
  mydev: readFileSync(resolve(process.cwd(), "myCA/myDev.crt"))
};

httpClient.on(
  "connect",
  async (req: IncomingMessage, clientSocket: Socket, head: Buffer) => {
    let host = (req.url || "").split(":")[0];

    try {
      if (fakeCrtPool[host] === undefined) {
        let fakeCrt = await generateCertificate(host);
        fakeCrtPool[host] = fakeCrt;
      }
      let serverSocket = connect(HTTPS.port, HTTPS.host, () => {
        clientSocket.write(
          "HTTP/1.1 200 Connection Established\r\n" +
            "Proxy-agent: Node.js-Proxy\r\n" +
            "\r\n"
        );
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });
    } catch (e) {
      console.error(e);
    }
  }
);

httpClient.listen(CLIENT.port, CLIENT.host, () => {
  console.log(`Started http proxy client on ${CLIENT.port}.`);
});

let httpsClient = createHttpsServer(
  {
    SNICallback: (domain, cb) => {
      let ctx = createSecureContext({
        key: sharedKey,
        cert: fakeCrtPool[domain]
      });
      cb(null, ctx);
    }
  },
  handler
);

httpsClient.listen(HTTPS.port, HTTPS.host, () => {
  console.log(`Started https proxy client on ${HTTPS.port}.`);
});
