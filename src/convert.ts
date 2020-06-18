import { IncomingMessage } from "http";

const SNP_URL = "SNP-Url";

export let hideUrl = (
  headers: IncomingMessage["headers"],
  url: string
): IncomingMessage["headers"] => {
  return { ...headers, [SNP_URL]: url };
};

export let getUrl = (headers: IncomingMessage["headers"]): string => {
  return (headers as any)[SNP_URL.toLowerCase()];
};
