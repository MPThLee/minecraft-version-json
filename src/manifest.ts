import { VERSION_MANIFEST_URL } from "./static.ts";
import { ClientJson } from "./types/json/client.ts";
import {
  ManifestVersion,
  VersionManifestJSON,
} from "./types/json/version_manifest.ts";
import { checkVesionJsonPresent } from "./utils.ts";

export async function downloadVersionManifest(): Promise<VersionManifestJSON> {
  const data = await fetch(VERSION_MANIFEST_URL);
  if (data.ok) {
    return Promise.resolve((await data.json()) as VersionManifestJSON);
  }

  return Promise.reject(data);
}

export function returnValidVersions(
  data: VersionManifestJSON
): ManifestVersion[] {
  return data.versions.filter((v) => checkVesionJsonPresent(v.id, v.type));
}

export async function downloadClientManifest(url: string): Promise<ClientJson> {
  const data = await fetch(url);
  if (data.ok) {
    return Promise.resolve((await data.json()) as ClientJson);
  }

  return Promise.reject(data);
}
