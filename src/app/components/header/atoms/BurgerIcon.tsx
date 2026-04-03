type BurgerIconProps = {
  open: boolean;
}

export const BurgerIcon = ({ open }: BurgerIconProps) => {
  return (
    <div
      className={`w-8.5 h-8.5 flex items-center justify-center rounded-lg transition-colors ${open ? "text-white bg-zinc-600" : "text-zinc-300 bg-zinc-700"}`}
    >
      <div className="w-4.5 h-3.5 flex flex-col justify-between relative">
        <span
          className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${open ? "translate-y-1.5 rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
        />
      </div>
    </div>
  );
};
