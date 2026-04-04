"use client";

import { Button } from "../../shared/atoms/Button";
import { FireIcon } from "../../shared/atoms/FireIcon";

type CheapestButtonProps = {
  active: boolean;
  onClick: () => void;
  className?: string;
};

export const CheapestButton = ({
  active,
  onClick,
  className = "",
}: CheapestButtonProps) => {
  return (
    <Button variant={active ? "success" : "ghost"} onClick={onClick} className={`w-fit shrink-0 ${className}`}>
      <FireIcon />
      Cheapest only
    </Button>
  );
};
