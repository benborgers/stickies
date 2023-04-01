import { useState } from "react";
import classNames from "classnames";
import { CircleNotch } from "phosphor-react";
import { AnimatePresence, motion } from "framer-motion";
import Input from "./Input";
import usePocketBase from "../hooks/usePocketBase";
import catchPocketBase from "../util/catchPocketBase";
import useUser from "../hooks/useUser";
import { loadNotes } from "../stores/notes";

type Mode = "login" | "signup";
const Modes: Mode[] = ["login", "signup"];
const prettyMode = (mode: Mode): string =>
  ({
    login: "Log in",
    signup: "Sign up",
  }[mode]);

export default function () {
  const pb = usePocketBase();
  const { user, refreshUser } = useUser();

  const [currentMode, setCurrentMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (currentMode === "login") {
      await catchPocketBase(async () => {
        await pb.collection("users").authWithPassword(email, password);
      });
    }

    if (currentMode === "signup") {
      await catchPocketBase(async () => {
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm: passwordConfirmation,
        });
        await pb.collection("users").authWithPassword(email, password);
      });
    }

    refreshUser();
    loadNotes();
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/20 grid place-items-center z-50"
        >
          <motion.div className="w-full max-w-md mb-16" exit={{ y: 8 }}>
            <div className="rounded-2xl shadow bg-white/80 backdrop-blur-md p-4 text-sm space-y-2 font-medium text-gray-400">
              <p>
                Stickies allows you to take notes and lay them out spatially on
                a finite-sized “desk”.
              </p>
              <p>
                When you no longer need a note, you can hide it, and later use
                Cmd+K to search for any note you’ve jotted down in the past.
              </p>
              <p>
                It mirrors the way my brain works: it allows me to put things
                that are top-of-mind in a physical place in front of me.
              </p>
            </div>
            <div className="mt-4 rounded-2xl shadow bg-white/80 backdrop-blur-md p-4">
              <div className="grid grid-cols-2 gap-x-2">
                {Modes.map((mode) => (
                  <button
                    key={mode}
                    className={classNames(
                      "block relative py-1.5 font-medium transition-colors rounded-lg text-sm",
                      {
                        "bg-gray-950/80 text-white": currentMode === mode,
                        "bg-gray-950/10 text-gray-600": currentMode !== mode,
                      }
                    )}
                    onClick={() => setCurrentMode(mode)}
                  >
                    <span className="relative z-50 [text-shadow:0_0_4px_rgba(255,255,255,0.5)]">
                      {prettyMode(mode)}
                    </span>
                  </button>
                ))}
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {currentMode === "signup" && (
                  <Input
                    label="Password confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                )}
                <div className="flex justify-end pt-2">
                  <button className="block relative px-4 py-1.5 bg-gray-950/80 text-white rounded-lg text-sm font-medium">
                    <span
                      className={classNames("relative transition-opacity", {
                        "opacity-0": loading,
                      })}
                    >
                      {prettyMode(currentMode)}
                    </span>
                    <div
                      className={classNames(
                        "absolute inset-0 grid place-items-center transition-opacity animate-spin",
                        { "opacity-0": !loading }
                      )}
                    >
                      <CircleNotch weight="bold" size={15} />
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
