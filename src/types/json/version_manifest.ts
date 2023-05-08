import { VersionType } from "./base.ts";

// https://minecraft.fandom.com/wiki/Version_manifest.json
export interface VersionManifestJSON {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: ManifestVersion[];
}

export interface ManifestVersion {
  id: string;
  type: VersionType;
  url: string; // url
  time: string; // ISO 8601
  releaseTime: string; // ISO 8601

  // v2 only
  sha1?: string;
  complianceLevel: number;
}
