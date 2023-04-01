import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swatches } from "phosphor-react";
import { Dialog } from "@headlessui/react";
import classNames from "classnames";
import userStore from "../stores/user";
import usePocketBase from "../hooks/usePocketBase";

const COLORS = [
  "red",
  "orange",
  "amber",
  "emerald",
  "teal",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "rose",
];

function randomElement(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export default function () {
  const pb = usePocketBase();
  const [open, setOpen] = useState(false);

  function generateTheme(color: (typeof COLORS)[number]) {
    const possibleLevels = [200, 300];
    const colorIndex = COLORS.indexOf(color);
    const adjacentColors = [
      COLORS.at(colorIndex - 2),
      COLORS.at(colorIndex - 1),
      COLORS.at(colorIndex),
      COLORS.at((colorIndex + 1) % COLORS.length),
      COLORS.at((colorIndex + 2) % COLORS.length),
    ];

    const stops: { color: string; level: number }[] = [
      {
        color: randomElement(adjacentColors),
        level: randomElement(possibleLevels),
      },
      { color, level: randomElement(possibleLevels) },
      { color, level: randomElement(possibleLevels) },
    ];

    if (stops[1].level < stops[2].level) {
      stops[1].level = stops[2].level;
    }

    const classes = stops
      .map(
        (stop, index) =>
          `${["from", "via", "to"][index]}-${stop.color}-${stop.level}`
      )
      .join(" ");

    userStore.set({ ...userStore.get()!, theme: classes });
    pb.collection("users").update(userStore.get()!.id, { theme: classes });
  }

  return (
    <>
      {!open && (
        <motion.button
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed bottom-4 right-4 h-7 w-7 bg-white/60 border border-white z-10 flex items-center justify-center rounded-full shadow"
          whileTap={{ scale: 0.93 }}
          onClick={() => setOpen(true)}
        >
          <Swatches weight="fill" size={18} className="text-gray-950/80" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <Dialog
            static
            open={open}
            onClose={() => setOpen(false)}
            className="relative z-50"
          >
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-4 right-4 bg-white/60 border border-white px-3 py-2 rounded-xl shadow"
            >
              <p className="text-gray-950/50 text-sm font-medium">
                Generate a theme based on...
              </p>
              <div className="mt-2.5 grid grid-cols-6 gap-2">
                {COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={classNames(
                      `bg-${color}-300`,
                      "h-6 w-6 rounded-full focus:outline-none",
                      "border-2 border-white"
                    )}
                    onClick={() => generateTheme(color)}
                  />
                ))}
              </div>
            </Dialog.Panel>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
