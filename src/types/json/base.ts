import { z } from "zod";

/**
 * The schema for the type of a minecraft game version.
 */
export const VersionTypeSchema = z.enum([
  "release",
  "snapshot",
  "old_beta",
  "old_alpha",
]);

/**
 * The type of a minecraft game version.
 */
export type VersionType = z.infer<typeof VersionTypeSchema>;
