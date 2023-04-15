import { atom, onMount } from "nanostores";
import type User from "../types/user";
import PocketBase from "pocketbase";
import { POCKETBASE_ENDPOINT } from "../util/constants";
const pb = new PocketBase(POCKETBASE_ENDPOINT);

const user = atom<null | User>(null);
export default user;

export async function refreshUser() {
  user.set(pb.authStore.model as unknown as User);

  try {
    // This will throw if the user token is no longer valid.
    await pb.collection("users").authRefresh();
  } catch {
    user.set(null);
  }
}

onMount(user, () => {
  refreshUser();
});
