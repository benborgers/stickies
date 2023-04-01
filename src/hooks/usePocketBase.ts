import PocketBase from "pocketbase";
import { POCKETBASE_ENDPOINT } from "../util/constants";

declare global {
  interface Window {
    pb: PocketBase;
  }
}

export default function () {
  const client = new PocketBase(POCKETBASE_ENDPOINT);
  window.pb = client;
  return client;
}
