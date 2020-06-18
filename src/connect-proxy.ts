import {
  IncomingMessage,
  request as httpReq,
  RequestOptions,
  ServerResponse
} from "http";
import { request as httpsReq } from "https";
import { URL } from "url";

type ProxyOptions1 = {
  port: number;
  host: string;
  path: string;
  auth?: string;
};

type ProxyOptions2 = {
  headers: IncomingMessage["headers"];
  inRes: ServerResponse;
};

export let connectProxy = ({ port, host, auth, path }: ProxyOptions1) => ({
  headers,
  inRes
}: ProxyOptions2) => {
  let { protocol } = new URL(path);

  let authBase64 = (() => {
    if (auth === undefined) return null;
    return `${Buffer.from(auth).toString("base64")}`;
  })();
  let options: RequestOptions = {
    host,
    port,
    path,
    headers: {
      ...headers,
      Host: new URL(path).hostname,
      ...(authBase64 !== null && {
        "Proxy-Authorization": `Basic ${authBase64}`
      })
    }
  };

  let proxyReq = (protocol === "https" ? httpsReq : httpReq)(options, res => {
    res.pipe(inRes);
  });
  proxyReq.on("error", e => {
    console.log(e);
  });
  proxyReq.end();
};
