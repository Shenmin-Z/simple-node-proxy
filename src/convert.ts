import { IncomingMessage } from "http";

export const SNP_URL = "x-snp-url";

export let hideUrl = (
  headers: IncomingMessage["headers"],
  url: string
): IncomingMessage["headers"] => {
  return { ...headers, [SNP_URL]: url };
};

export let getUrl = (headers: IncomingMessage["headers"]): string => {
  return (headers as any)[SNP_URL.toLowerCase()];
};
