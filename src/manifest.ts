import { getLogger } from "@logtape/logtape";
import { VERSION_MANIFEST_URL } from "./static.ts";
import { ClientJson, clientJsonSchema } from "./types/json/client.ts";
import {
  ManifestVersion,
  VersionManifestJSON,
  versionManifestJSONSchema,
} from "./types/json/version_manifest.ts";
import { checkVersionJsonPresent } from "./utils.ts";

const LOGGER = getLogger(["minecraft-version-json", "manifest"]);

export async function downloadVersionManifest(): Promise<VersionManifestJSON> {
  const data = await fetch(VERSION_MANIFEST_URL);
  LOGGER.debug("Downloaded version manifest from '{url}': {status}", {
    url: VERSION_MANIFEST_URL,
    status: data.status,
  });

  if (data.ok) {
    const json = await data.json();

    const result = versionManifestJSONSchema.safeParse(json);
    if (result.success) {
      LOGGER.debug("Parsed version manifest for '{url}' successfully", {
        url: VERSION_MANIFEST_URL,
      });
      return Promise.resolve(result.data);
    }

    LOGGER.error("Failed to parse version manifest '{url}': {result}", {
      url: VERSION_MANIFEST_URL,
      result,
    });
    return Promise.reject(result.error);
  }

  LOGGER.error("Failed to download version manifest from '{url}': {status}", {
    url: VERSION_MANIFEST_URL,
    status: data.status,
  });

  return Promise.reject(data);
}

export function returnValidVersions(
  data: VersionManifestJSON,
): ManifestVersion[] {
  return data.versions.filter((v) => checkVersionJsonPresent(v.id, v.type));
}

export async function downloadClientManifest(url: string): Promise<ClientJson> {
  const data = await fetch(url);
  LOGGER.debug("Downloaded client manifest from '{url}': {status}", {
    url,
    status: data.status,
  });

  if (data.ok) {
    const json = await data.json();

    const result = clientJsonSchema.safeParse(json);
    if (result.success) {
      LOGGER.debug("Parsed client manifest for '{url}' successfully", { url });
      return Promise.resolve(result.data);
    }

    LOGGER.error("Failed to parse client manifest: {result}", { result });
    return Promise.reject(result.error);
  }

  LOGGER.error("Failed to download client manifest from '{url}': {status}", {
    url,
    status: data.status,
  });

  return Promise.reject(data);
}
