export let getHP = (
  headerHost: string | undefined
): false | { port: number; host: string } => {
  try {
    let [host, port] = (headerHost || "").split(":");
    return { host, port: parseInt(port) };
  } catch {
    return false;
  }
};
