import { useState } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";

type Mode = "login" | "signup";
const Modes: Mode[] = ["login", "signup"];
const prettyMode = (mode: Mode): string =>
  ({
    login: "Log in",
    signup: "Sign up",
  }[mode]);

export default function () {
  const [currentMode, setCurrentMode] = useState<Mode>("login");

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-md rounded-2xl shadow bg-white p-4">
        <div className="grid grid-cols-2 gap-x-2">
          {Modes.map((mode) => (
            <button
              key={mode}
              className={classNames(
                "block relative py-1.5 font-medium transition-colors hover:bg-gray-100 rounded-lg",
                {
                  "text-yellow-950": currentMode === mode,
                  "text-gray-500": currentMode !== mode,
                }
              )}
              onClick={() => setCurrentMode(mode)}
            >
              {currentMode === mode && (
                <motion.div
                  className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-lg absolute inset-0 z-40"
                  layoutId="highlight"
                />
              )}
              <span className="relative z-50 [text-shadow:0_0_4px_rgba(255,255,255,0.5)]">
                {prettyMode(mode)}
              </span>
            </button>
          ))}
        </div>

        <form></form>
      </div>
    </div>
  );
}
