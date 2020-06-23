import {
  IncomingMessage,
  request as httpReq,
  RequestOptions,
  ServerResponse
} from "http";
import { request as httpsReq } from "https";
import { URL } from "url";

type RequestOptions1 = {
  port?: number;
  host?: string;
  path: string;
  auth?: string;
};

type RequestOptions2 = {
  headers: IncomingMessage["headers"];
  inRes: ServerResponse;
};

type MakeRequest = { (p1: RequestOptions1): (p2: RequestOptions2) => void };
export let makeRequest: MakeRequest = ({ port, host, auth, path }) => ({
  headers,
  inRes
}) => {
  let { protocol, hostname: hostFromUrl, port: portFromUrl } = new URL(path);

  port = port || parseInt(portFromUrl);
  host = host || hostFromUrl;
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
