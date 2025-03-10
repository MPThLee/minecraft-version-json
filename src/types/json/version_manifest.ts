/**
 * Schema descriptions based on Minecraft client JSON files.
 * @see https://minecraft.wiki/w/Version_manifest.json Minecraft Wiki: Client.json
 */

import { z } from "zod";
import { VersionTypeSchema } from "./base.ts";

/**
 * ManifestVersion schema.
 * Represents one of the version entries.
 *
 * {{nbt|compound}} One of the version entries.
 */
export const manifestVersionSchema = z.object({
  /**
   * The ID of this version.
   * {{nbt|string|id}}
   */
  id: z.string(),
  /**
   * The type of this version; usually "release", "snapshot", "old_beta" or "old_alpha".
   * {{nbt|string|type}}
   */
  type: VersionTypeSchema,
  /**
   * The link to the client JSON for this version.
   * {{nbt|string|url}}
   */
  url: z.string(),
  /**
   * A timestamp in ISO 8601 format of when the version files were last updated on the manifest.
   * {{nbt|string|time}}
   */
  time: z.string(),
  /**
   * The release time of this version in ISO 8601 format.
   * {{nbt|string|releaseTime}}
   */
  releaseTime: z.string(),
  /**
   * The SHA1 hash of the version (v2 only).
   * {{nbt|string|sha1}} (''v2 only'')
   */
  sha1: z.string().optional(),
  /**
   * The compliance level (v2 only). If 0, the launcher warns the user about safety features.
   * {{nbt|int|complianceLevel}} (''v2 only'')
   */
  complianceLevel: z.number().optional(),
});

/**
 * VersionManifestJSON schema.
 * Represents the root tag of version_manifest.json.
 *
 * {{nbt|compound}} The root tag.
 */
export const versionManifestJSONSchema = z.object({
  /**
   * The latest release and snapshot versions.
   * {{nbt|compound|latest}}
   */
  latest: z.object({
    /**
     * The ID of the latest release version.
     * {{nbt|string|release}}
     */
    release: z.string(),
    /**
     * The ID of the latest snapshot version.
     * {{nbt|string|snapshot}}
     */
    snapshot: z.string(),
  }),
  /**
   * A list of versions available.
   * {{nbt|list|versions}}
   */
  versions: z.array(manifestVersionSchema),
});

/** Typescript type for the version manifest JSON. */
export type VersionManifestJSON = z.infer<typeof versionManifestJSONSchema>;
export type ManifestVersion = z.infer<typeof manifestVersionSchema>;
