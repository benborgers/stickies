import Auth from "./Auth";
import LogOut from "./LogOut";
import useUser from "../hooks/useUser";

export default function () {
  const { user } = useUser();

  return (
    <div>
      <Auth />
      <LogOut />

      <pre>{JSON.stringify({ user }, null, 2)}</pre>
    </div>
  );
}
