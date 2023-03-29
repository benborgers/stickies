import { useState } from "react";
import classNames from "classnames";
import Input from "./Input";
import usePocketBase from "../hooks/usePocketBase";
import { CircleNotch } from "phosphor-react";
import catchPocketBase from "../util/catchPocketBase";
import useUser from "../hooks/useUser";

type Mode = "login" | "signup";
const Modes: Mode[] = ["login", "signup"];
const prettyMode = (mode: Mode): string =>
  ({
    login: "Log in",
    signup: "Sign up",
  }[mode]);

export default function () {
  const pb = usePocketBase();
  const { refreshUser } = useUser();

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
    setLoading(false);
  }

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
            <button className="block relative px-4 py-1.5 bg-yellow-400 rounded-lg text-sm font-medium text-yellow-950">
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
    </div>
  );
}
