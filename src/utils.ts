import { IncomingMessage } from "http";

export let filterHeader = (
  header: IncomingMessage["headers"],
  list: string[]
) => {
  let res: IncomingMessage["headers"] = {};
  let llist = list.map(i => i.toLowerCase());
  Object.entries(header).forEach(([key, value]) => {
    if (!llist.includes(key)) {
      res[key] = value;
    }
  });
  return res;
};
