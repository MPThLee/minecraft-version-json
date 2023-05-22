export const VERSION_MANIFEST_URL =
  "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

export const STORE_DIR = Deno.env.get("MCV_STORE_DIR") ?? "./versions/";

export const TEMP_DIR = Deno.makeTempDirSync();
