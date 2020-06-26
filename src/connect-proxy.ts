import {
  IncomingMessage,
  request as httpReq,
  RequestOptions,
  ServerResponse,
  ClientRequest
} from "http";
import { request as httpsReq } from "https";
import { URL } from "url";

import { filterHeader } from "./utils";
import { SNP_URL } from "./convert";

type RequestOptions1 = {
  port?: number;
  host?: string;
  path: string;
  auth?: string;
};

type RequestOptions2 = {
  headers: IncomingMessage["headers"];
  inReq: IncomingMessage;
  inRes: ServerResponse;
};

type MakeRequest = { (p1: RequestOptions1): (p2: RequestOptions2) => void };
export let makeRequest: MakeRequest = ({ port, host, auth, path }) => ({
  headers,
  inRes,
  inReq
}) => {
  if (path === undefined) {
    inRes.statusCode = 418;
    inRes.end();
    return;
  }

  let { protocol } = new URL(path);

  let direct = host === undefined;

  let proxyReq: ClientRequest;
  let request = direct && protocol === "https:" ? httpsReq : httpReq;
  let onRes = (res: IncomingMessage) => {
    inRes.statusCode = res.statusCode || 200;
    inRes.statusMessage = res.statusMessage || "";

    Object.entries(res.headers).forEach(([k, v]) => {
      inRes.setHeader(k, v || "");
    });
    res.pipe(inRes);
  };

  if (direct) {
    proxyReq = request(
      path,
      {
        method: inReq.method,
        headers: {
          ...filterHeader(headers, ["proxy-authorization", SNP_URL, "host"])
        }
      },
      onRes
    );
  } else {
    let authBase64 = (() => {
      if (auth === undefined) return null;
      return `${Buffer.from(auth).toString("base64")}`;
    })();

    let options: RequestOptions = {
      host,
      port,
      path,
      method: inReq.method,
      headers: {
        ...headers,
        host: new URL(path).hostname,
        ...(authBase64 !== null && {
          "proxy-authorization": `Basic ${authBase64}`
        })
      }
    };

    proxyReq = request(options, onRes);
  }
  proxyReq.on("error", e => {
    console.log(e);
  });
  inReq.on("data", data => {
    proxyReq.write(data);
  });
  inReq.on("end", () => {
    proxyReq.end();
  });
};
