import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { Socket, connect } from "net";
import { readFileSync } from "fs";
import { resolve } from "path";

import { getParams } from "./get-params";
import { connectProxy } from "./connect-proxy";
import { hideUrl } from "./convert";

let { PROXY, SERVER, CLIENT, HTTPS } = getParams();

let httpClient = createHttpServer((req, res) => {
  connectProxy({
    port: PROXY.port,
    host: PROXY.host,
    auth: PROXY.auth,
    path: `http://${SERVER.host}:${SERVER.port}`
  })({ headers: hideUrl(req.headers, req.url as string), inRes: res });
});

httpClient.on("connect", (_, clientSocket: Socket, head: Buffer) => {
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
});

httpClient.listen(CLIENT.port, CLIENT.host, () => {
  console.log(`Started http proxy client on ${CLIENT.port}.`);
});

let httpsClient = createHttpsServer(
  {
    key: readFileSync(resolve(process.cwd(), "myCA/myDev.key")),
    cert: readFileSync(resolve(process.cwd(), "myCA/myDev.crt"))
  },
  (req, res) => {
    res.writeHead(200);
    res.end("https!");
  }
);

httpsClient.listen(HTTPS.port, HTTPS.host, () => {
  console.log(`Started https proxy client on ${HTTPS.port}.`);
});
