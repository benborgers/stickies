import { useEffect, useState } from "react";
import usePocketBase from "./usePocketBase";

export default function () {
  const pb = usePocketBase();
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
    return unsubscribe;
  }, []);

  return user;
}
