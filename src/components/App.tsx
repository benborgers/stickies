import usePocketBase from "../hooks/usePocketBase";
import useUser from "../hooks/useUser";
import Auth from "./Auth";

export default function () {
  const pb = usePocketBase();
  const user = useUser();

  return (
    <div>
      {!user && <Auth />}
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
    </div>
  );
}
