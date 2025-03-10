/**
 * Schema descriptions based on Minecraft client JSON files.
 * @see https://minecraft.wiki/w/Client.json Minecraft Wiki: Client.json
 */

import { z } from "zod";
import { VersionTypeSchema } from "./base.ts";

/* ========================================================================== */
/* Base Schemas                                                             */
/* ========================================================================== */

/**
 * Base download information.
 * @property {string} sha1 - The SHA1 hash.
 * @property {number} size - The file size in bytes.
 * @property {string} url - The download URL.
 */
export const baseDownloadSchema = z.object({
  /* SHA1 hash */
  sha1: z.string(),
  /* File size in bytes */
  size: z.number(),
  /* Download URL */
  url: z.string(),
});

/**
 * Artifact download information.
 * @property {string} path - Path to store the downloaded artifact.
 */
export const artifactDownloadSchema = baseDownloadSchema.extend({
  /* Relative path to store the artifact */
  path: z.string(),
});

/**
 * Logging download information.
 * @property {string} id - Identifier for the logging file.
 */
export const loggingDownloadSchema = baseDownloadSchema.extend({
  /* Identifier for the logging file */
  id: z.string(),
});

/* ========================================================================== */
/* Asset and Download Schemas                                               */
/* ========================================================================== */

/**
 * Asset index information.
 * @property {string} id - The assets version id.
 * @property {string} sha1 - The SHA1 hash of the assets file.
 * @property {number} size - Size of the assets file.
 * @property {number} totalSize - Total size of the version.
 * @property {string} url - URL to download the assets.
 */
export const assetIndexSchema = z.object({
  /* Assets version id */
  id: z.string(),
  /* SHA1 hash of assets file */
  sha1: z.string(),
  /* File size */
  size: z.number(),
  /* Total size of the assets version */
  totalSize: z.number(),
  /* Assets download URL */
  url: z.string(),
});

/**
 * Downloads information.
 * @property {object} client - Client jar download information.
 * @property {object} client_mappings - Client mappings download information.
 * @property {object} server - Server jar download information.
 * @property {object} server_mappings - Server mappings download information.
 */
export const rootDownloadsSchema = z.object({
  /* Client jar download information */
  client: baseDownloadSchema,
  /* Client mappings download information */
  client_mappings: baseDownloadSchema,
  /* Server jar download information */
  server: baseDownloadSchema,
  /* Server mappings download information */
  server_mappings: baseDownloadSchema,
});

/* ========================================================================== */
/* Java Version Schema                                                      */
/* ========================================================================== */

/**
 * Java version information.
 * @property {string} component - The Java component name.
 * @property {number} majorVersion - The major version number.
 */
export const javaVersionSchema = z.object({
  /* Java component name */
  component: z.string(),
  /* Major version number */
  majorVersion: z.number(),
});

/* ========================================================================== */
/* Rules and Conditional Arguments                                          */
/* ========================================================================== */

/**
 * Base rule for conditional arguments.
 * @property {"allow"|"disallow"} action - Rule action.
 * @property {string|string[]} value - The argument value(s).
 */
export const baseRuleSchema = z.object({
  /* Rule action: allow or disallow */
  action: z.enum(["allow", "disallow"]),
});

/**
 * Feature rule schema.
 * @property {object} features - Feature flags that determine the rule.
 */
export const featureRuleSchema = baseRuleSchema.extend({
  /* Feature flags; may include is_demo_user, has_custom_resolution, etc. */
  features: z
    .object({
      is_demo_user: z.boolean().optional(),
      has_custom_resolution: z.boolean().optional(),
      has_quick_plays_support: z.boolean().optional(),
      is_quick_play_singleplayer: z.boolean().optional(),
      is_quick_play_multiplayer: z.boolean().optional(),
      is_quick_play_realms: z.boolean().optional(),
    })
    .passthrough(),
});

/**
 * OS rule schema.
 * @property {object} os - Operating system details.
 * @property {"windows"|"osx"|"linux"} os.name - OS name.
 * @property {string} os.version - OS version regex.
 * @property {string} os.arch - OS architecture.
 */
export const osRuleSchema = baseRuleSchema.extend({
  os: z
    .object({
      /* OS name */
      name: z.enum(["windows", "osx", "linux"]).optional(),
      /* OS version regex */
      version: z.string().optional(),
      /* OS architecture */
      arch: z.union([z.literal("x86"), z.string()]).optional(),
    })
    .passthrough()
    .optional(),
});

export const jvmRuleSchema = baseRuleSchema
  .merge(osRuleSchema)
  .merge(featureRuleSchema);
/**
 * Conditional argument based on feature rules.
 * @property {Array} rules - Array of feature rules.
 */
export const conditionalFeatureArgumentSchema = z.object({
  /* Array of feature rules */
  rules: z.array(featureRuleSchema),
  /* Argument value or array of values */
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

/**
 * Conditional argument based on OS rules.
 * @property {Array} rules - Array of OS rules.
 */
export const conditionalOsArgumentSchema = z.object({
  /* Array of OS rules */
  rules: z.array(osRuleSchema),
  /* Argument value or array of values */
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

/**
 * Game argument schema: either a simple string or a condition based on features.
 */
export const gameArgumentSchema = z.union([
  z.string(),
  conditionalFeatureArgumentSchema,
]);

/**
 * JVM argument schema: either a simple string or a condition based on OS.
 */
export const jvmArgumentSchema = z.union([
  z.string(),
  conditionalOsArgumentSchema,
]);

/**
 * Combined game and JVM argument schema.
 */
export const gameAndJvmArgumentSchema = z.object({
  /** Contains arguments supplied to the game, such as information about the username and the version. */
  game: z.array(gameArgumentSchema),
  /** Contains JVM arguments, such as information about memory allocation, garbage collector selection, or environment variables. */
  jvm: z.array(jvmArgumentSchema),
});

/* ========================================================================== */
/* Library and Logging Schemas                                              */
/* ========================================================================== */

/**
 * Library downloads information.
 * @property {object} artifact - Artifact download data.
 * @property {any} [classifiers] - Optional classifiers for additional artifacts.
 */
export const libraryDownloadsSchema = z.object({
  /* Artifact download information */
  artifact: artifactDownloadSchema,
  /* Optional classifiers for other platforms */
  classifiers: z.any().optional(),
});

/**
 * Library schema.
 * @property {object} downloads - Download details for the library.
 * @property {string} name - Maven name of the library.
 * @property {string} url - Repository URL for the library.
 * @property {any} [natives] - Optional native library information.
 * @property {any} [extract] - Optional extraction rules.
 * @property {Array} rules - Array of OS rules.
 */
export const librarySchema = z.object({
  /* Library download details */
  downloads: libraryDownloadsSchema,
  /* Maven identifier for the library */
  name: z.string(),
  /* Repository URL - Used by Forge Mod Loader */
  url: z.string().optional(),
  /* Optional native libraries info */
  natives: z.any().optional(),
  /* Optional extraction rules */
  extract: z.any().optional(),
  /* Rules for inclusion based on OS */
  rules: z.array(osRuleSchema).optional(),
});

/**
 * Logging client configuration.
 * @property {string} argument - JVM argument for setting the log configuration.
 * @property {object} file - Log4j2 XML file download information.
 */
export const loggingClientSchema = z.object({
  /* JVM argument for log configuration */
  argument: z.string(),
  /* Log4j2 XML configuration file details */
  file: loggingDownloadSchema,
  /* Logging type */
  type: z.union([z.literal("log4j2-xml"), z.string()]),
});

/**
 * Logging configuration.
 * @property {object} client - Client-specific logging configuration.
 * @property {"log4j2-xml"|string} type - Logging type.
 */
export const loggingSchema = z
  .object({
    /* Logging client configuration */
    client: loggingClientSchema,
  })
  .passthrough();

/* ========================================================================== */
/* Client JSON Schema                                                       */
/* ========================================================================== */

/**
 * Client JSON schema.
 * @property {Array} arguments - List of game or JVM arguments.
 * @property {object} assetIndex - Assets index details.
 * @property {string} assets - Assets version string.
 * @property {number} [complianceLevel] - Compliance level.
 * @property {object} downloads - Downloads details.
 * @property {string} id - Version identifier.
 * @property {object} javaVersion - Java version information.
 * @property {Array} libraries - List of libraries.
 * @property {object} logging - Logging configuration details.
 * @property {string} mainClass - Main game class.
 * @property {number} minimumLauncherVersion - Minimum launcher version.
 * @property {string} releaseTime - Release date-time in ISO-8601 format.
 * @property {string} time - Time in ISO-8601 format.
 * @property {"release"|"snapshot"|"old_beta"|"old_alpha"} type - Version type.
 */
export const clientJsonSchema = z
  .object({
    /* List of game or JVM arguments */
    arguments: gameAndJvmArgumentSchema,
    /* Assets index information */
    assetIndex: assetIndexSchema,
    /* Assets version string */
    assets: z.string(),
    /* Compliance level (optional) */
    complianceLevel: z.number().optional(),
    /* Download information */
    downloads: rootDownloadsSchema,
    /* Version identifier */
    id: z.string(),
    /* Java version details */
    javaVersion: javaVersionSchema,
    /* Array of libraries */
    libraries: z.array(librarySchema),
    /* Logging configuration details */
    logging: loggingSchema,
    /* Main game class */
    mainClass: z.string(),
    /* Minimum launcher version number */
    minimumLauncherVersion: z.number(),
    /* Release time in ISO-8601 format */
    releaseTime: z.string(),
    /* Time in ISO-8601 format */
    time: z.string(),
    /* Version type */
    type: VersionTypeSchema,
  })
  .strict();

/* ========================================================================== */
/* Exported Types                                                           */
/* ========================================================================== */

/**
 * Client JSON type inferred from the schema.
 */
export type ClientJson = z.infer<typeof clientJsonSchema>;
