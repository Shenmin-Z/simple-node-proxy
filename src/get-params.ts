import { resolve } from "path";

type Params = {
  PROXY: {
    host: string;
    port: number;
    auth: string;
  };
  SERVER: {
    host: string;
    port: number;
    realPort: number;
    proxy?: string; // or true
  };
  CLIENT: {
    host: string;
    port: number;
  };
  HTTPS: {
    host: string;
    port: number;
  };
};

let cached: Params | null = null;

export let getParams = (): Params => {
  if (cached !== null) return cached;

  let path = process.argv.find((_, idx, arr) => arr[idx - 1] === "--config");
  let config;
  if (path) {
    config = require(resolve(path));
  } else {
    config = require(resolve(process.cwd(), "config.json"));
  }
  cached = config;
  return config;
};
