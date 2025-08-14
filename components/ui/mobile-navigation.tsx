import { cn } from "../../lib/utils";
import { EllipsisVertical } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

export const FloatingDock = ({
  items,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <div className={cn("relative block left-[45%] bottom-24 md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="nav" className="absolute bottom-full mb-2 flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}>
                <Button
                  key={item.title}
                  onClick={() => router.push(item.href)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-600">
                  <div className="h-4 w-4">{item.icon}</div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/70">
        <EllipsisVertical className="h-5 w-5 text-gray-200" />
      </button>
    </div>
  );
};
