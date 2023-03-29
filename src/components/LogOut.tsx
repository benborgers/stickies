import { AnimatePresence, motion } from "framer-motion";
import usePocketBase from "../hooks/usePocketBase";
import useUser from "../hooks/useUser";

export default function () {
  const pb = usePocketBase();
  const { user, refreshUser } = useUser();

  return (
    <AnimatePresence>
      {user && (
        <motion.div className="fixed top-3 right-3">
          <button
            className="bg-gradient-to-b from-yellow-400 to-yellow-500 text-yellow-950 text-sm font-medium px-3 py-1 rounded-lg shadow-sm"
            onClick={() => {
              pb.authStore.clear();
              refreshUser();
            }}
          >
            Log out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
