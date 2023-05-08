// Since this is still unknown, it uses any.
// deno-lint-ignore-file no-explicit-any
import { VersionType } from "./base.ts";

// https://minecraft.fandom.com/wiki/Client.json
export interface ClientJson {
  arguments: GameAndJvmArgument[];
  assetIndex: AssetIndex;
  assets: string;
  complianceLevel?: number;
  downloads: RootDownloads;
  id: string;
  javaVersion: JavaVersion;
  libraries: Library[];
  logging: Logging;
  mainClass:
    | "net.minecraft.client.main.Main"
    | "com.mojang.rubydung.RubyDung"
    | string;
  minimumLauncherVersion: number;
  releaseTime: string;
  time: string;
  type: VersionType;
}

interface AssetIndex {
  id: string;
  sha1: string;
  size: number;
  totalSize: number;
  url: string;
}

interface RootDownloads {
  client: BaseDownload;
  client_mappings: BaseDownload;
  server: BaseDownload;
  server_mappings: BaseDownload;
}

interface Library {
  downloads: {
    artifact: ArtifactDownload;
    classifiers?: any;
  };
  name: string;
  url: string;

  // Can't found. but maybe on older version.
  natives?: any;
  extract?: any;
  rules: OsRule[];
}

interface Logging {
  client: {
    argument: string;
    file: LoggingDownload;
  };
  type: "log4j2-xml" | string;
  [x: string]: any;
}

interface ArtifactDownload extends BaseDownload {
  path: string;
}

interface LoggingDownload extends BaseDownload {
  id: string;
}

interface BaseDownload {
  sha1: string;
  size: number;
  url: string;
}

interface JavaVersion {
  component:
    | "jre-legacy"
    | "java-runtime-alpha"
    | "java-runtime-gamma"
    | string;
  majorVersion: 8 | 16 | 17 | number;
}

type Argument = string | string[];
type GameAndJvmArgument = GameArgument | JvmArgument;
type GameArgument = string | ConditionalArgument<FeatureRule>;
type JvmArgument = string | ConditionalArgument<OsRule>;

type Rule = FeatureRule | OsRule;

interface ConditionalArgument<R extends Rule> {
  rules: R[];
}
interface FeatureRule extends BaseRule {
  features: {
    [x: string]: boolean;
  };
}

interface OsRule extends BaseRule {
  os: {
    name: string;
    version: string;
    arch: string;
    [x: string]: any;
  };
}

interface BaseRule {
  action: "allow";
  value: Argument;
}
