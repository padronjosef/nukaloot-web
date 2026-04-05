import Image from "next/image";
import { ALL_STORES } from "@/shared/lib/stores";

export const StoreIcon = ({ storeName }: { storeName: string }) => {
  const icon = ALL_STORES[storeName];
  if (!icon) return null;

  return (
    <Image
      src={`/store-icons/${icon.file}.${icon.ext}`}
      alt={storeName}
      title={storeName}
      width={20}
      height={20}
      className="inline-block rounded-sm"
    />
  );
};
