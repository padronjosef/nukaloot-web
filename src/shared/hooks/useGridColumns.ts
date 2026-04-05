"use client";

import { useState, useEffect } from "react";

export const useGridColumns = () => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 768) setColumns(3);       // md
      else if (window.innerWidth >= 640) setColumns(2);  // sm
      else setColumns(1);                                 // mobile
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
};
