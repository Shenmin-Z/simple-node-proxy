let isServer = process.argv.some(i => i === "-s" || i === "--server");
let isClient = process.argv.some(i => i === "-c" || i === "--client");

if (isServer) {
  require("./server");
} else if (isClient) {
  require("./client");
} else {
  require("./server");
  require("./client");
}
