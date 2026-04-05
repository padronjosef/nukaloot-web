import type { TypeFilter } from "./types";

export const API_URL = "/api";

export const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All",
  game: "Base Game",
  dlc: "DLC",
  bundle: "Bundle",
  other: "Other",
};

type StoreInfo = { file: string; ext: "png" | "svg"; url: string };

export const MAIN_STORES: Record<string, StoreInfo> = {
  "Blizzard": { file: "blizzard", ext: "png", url: "https://shop.battle.net" },
  "CDKeys": { file: "cdkeys", ext: "png", url: "https://www.cdkeys.com" },
  "Eneba": { file: "eneba", ext: "png", url: "https://www.eneba.com" },
  "Epic Games": { file: "epicgames", ext: "svg", url: "https://store.epicgames.com" },
  "G2A": { file: "g2a", ext: "png", url: "https://www.g2a.com" },
  "GOG": { file: "gog", ext: "png", url: "https://www.gog.com" },
  "Humble Bundle": { file: "humble", ext: "png", url: "https://www.humblebundle.com" },
  "Instant Gaming": { file: "instantgaming", ext: "png", url: "https://www.instant-gaming.com" },
  "Kinguin": { file: "kinguin", ext: "png", url: "https://www.kinguin.net" },
  "Origin": { file: "origin", ext: "svg", url: "https://www.origin.com" },
  "Steam": { file: "steam", ext: "png", url: "https://store.steampowered.com" },
  "Uplay": { file: "ubisoft", ext: "svg", url: "https://store.ubisoft.com" },
};

export const OTHER_STORES: Record<string, StoreInfo> = {
  "2Game": { file: "2game", ext: "svg", url: "https://2game.com" },
  "DLGamer": { file: "dlgamer", ext: "png", url: "https://www.dlgamer.com" },
  "DreamGame": { file: "dreamgame", ext: "svg", url: "https://www.dreamgame.com" },
  "Fanatical": { file: "fanatical", ext: "png", url: "https://www.fanatical.com" },
  "GameBillet": { file: "gamebillet", ext: "png", url: "https://www.gamebillet.com" },
  "GamersGate": { file: "gamersgate", ext: "png", url: "https://www.gamersgate.com" },
  "Games Planet": { file: "gamesplanet", ext: "png", url: "https://www.gamesplanet.com" },
  "Gamesload": { file: "gamesload", ext: "svg", url: "https://www.gamesload.com" },
  "GreenManGaming": { file: "greenmangaming", ext: "svg", url: "https://www.greenmangaming.com" },
  "IndieGala": { file: "indiegala", ext: "png", url: "https://www.indiegala.com" },
  "Noctre": { file: "noctre", ext: "png", url: "https://www.noctre.com" },
  "WinGameStore": { file: "wingamestore", ext: "png", url: "https://www.wingamestore.com" },
};

export const ALL_STORES: Record<string, StoreInfo> = { ...MAIN_STORES, ...OTHER_STORES };

export const HOME_BACKGROUNDS = [
  "/home-backgrounds/home-background-1.jpg",
  "/home-backgrounds/home-background-2.jpg",
  "/home-backgrounds/home-background-3.png",
  "/home-backgrounds/home-background-4.jpg",
  "/home-backgrounds/home-background-5.jpg",
];
