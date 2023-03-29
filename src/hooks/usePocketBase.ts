import PocketBase from "pocketbase";

declare global {
  interface Window {
    pb: PocketBase;
  }
}

export default function () {
  const client = new PocketBase("https://pb-stickies.elk.sh");
  window.pb = client;
  return client;
}
