import { useState } from "react";
import classNames from "classnames";
import Input from "./Input";

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
      <div className="w-full max-w-md rounded-2xl shadow bg-white p-5">
        <div className="grid grid-cols-2 gap-x-2">
          {Modes.map((mode) => (
            <button
              key={mode}
              className={classNames(
                "block relative py-1.5 font-medium transition-colors rounded-lg text-sm",
                {
                  "bg-yellow-400 text-yellow-950": currentMode === mode,
                  "bg-gray-100 text-gray-500": currentMode !== mode,
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

        <form className="mt-6 space-y-4">
          <Input label="Email" type="email" />
          <Input label="Password" type="password" />
          {currentMode === "login" && (
            <Input label="Password confirmation" type="password" />
          )}
          <div className="flex justify-end pt-2">
            <button className="px-4 py-1.5 bg-yellow-400 rounded-lg text-sm font-medium text-yellow-950">
              {prettyMode(currentMode)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
