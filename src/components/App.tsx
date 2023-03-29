import { AnimatePresence, motion } from "framer-motion";
import usePocketBase from "../hooks/usePocketBase";
import useUser from "../hooks/useUser";
import Auth from "./Auth";

export default function () {
  const pb = usePocketBase();
  const { user } = useUser();

  return (
    <div>
      <AnimatePresence>
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Auth />
          </motion.div>
        )}
      </AnimatePresence>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
    </div>
  );
}
