import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import usePocketBase from "./usePocketBase";
import userStore from "../stores/user";
import type User from "../types/user";

export default function () {
  const pb = usePocketBase();
  const user = useStore(userStore);

  useEffect(() => {
    userStore.set(pb.authStore.model as User);
  }, []);

  function refreshUser() {
    userStore.set(pb.authStore.model as User);
  }

  return { user, refreshUser };
}
