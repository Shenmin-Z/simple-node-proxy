import { spawn } from "child_process";
import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

let generate = (host: string) =>
  spawn(
    "openssl",
    [
      "x509",
      "-req",
      "-in",
      "myDev.csr",
      "-CA",
      "myCA.pem",
      "-CAkey",
      "myCA.key",
      "-out",
      `generated/${host}.crt`,
      "-days",
      "825",
      "-sha256",
      "-extfile",
      `generated/${host}.ext`,
      "-passin",
      "file:passphrase.txt"
    ],
    {
      shell: true,
      cwd: resolve(process.cwd(), "myCA")
    }
  );

let ext = readFileSync(resolve(process.cwd(), "myCA/myDev.ext"), "utf8");
let writeTmpExt = (host: string) => {
  writeFileSync(
    resolve(process.cwd(), `myCA/generated/${host}.ext`),
    ext.replace("myDev", host),
    "utf8"
  );
};
export let generateCertificate = (host: string) => {
  return new Promise<Buffer>((res, rej) => {
    let crtPath = resolve(process.cwd(), `myCA/generated/${host}.crt`);
    if (existsSync(crtPath)) {
      res(readFileSync(crtPath));
    }
    writeTmpExt(host);
    let openssl = generate(host);
    openssl.on("exit", () => {
      res(readFileSync(crtPath));
    });
    openssl.on("error", rej);
  });
};
