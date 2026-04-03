import Image from "next/image";
import { STORE_ICONS } from "../../../lib/stores";

export const StoreIcon = ({ storeName }: { storeName: string }) => {
  const icon = STORE_ICONS[storeName];
  if (!icon) return null;

  return (
    <Image
      src={`/store-icons/${icon.file}.${icon.ext}`}
      alt={storeName}
      title={storeName}
      width={24}
      height={24}
      className="inline-block rounded-sm"
    />
  );
};
