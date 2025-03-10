import { STORE_DIR, TEMP_DIR } from "./static.ts";
import { getLogger } from "@logtape/logtape";
import { checkStoreDirAndCreate } from "./utils.ts";
import { downloadClientManifest } from "./manifest.ts";

const LOGGER = getLogger(["minecraft-version-json", "jar"]);

export async function extractData(
  client_url: string,
  version: string
): Promise<boolean> {
  try {
    LOGGER.info(`Download ${version} data from ${client_url}...`);
    const data = await downloadClientManifest(client_url);
    const url = data.downloads.client.url;

    LOGGER.info(`Download ${version}.jar from ${url}...`);
    await downloadJarFile(url, version);

    LOGGER.info(`Extract ${version}.jar file...`);
    const extract = await extractJarFile(version);
    LOGGER.info(`Jar extract process exited with ${extract.code}`);

    LOGGER.info(`Move version.json to ${version}/version.json...`);
    const target = `${STORE_DIR}/${version}`;
    checkStoreDirAndCreate(version);
    await Deno.rename(
      `${TEMP_DIR}/${version}_decompress/version.json`,
      `${target}/version.json`
    );

    LOGGER.info(`Delete temp files related to ${version}...`);
    await Deno.remove(`${TEMP_DIR}/${version}.jar`, { recursive: true });
    await Deno.remove(`${TEMP_DIR}/${version}_decompress`, {
      recursive: true,
    });

    return Promise.resolve(true);
  } catch (error) {
    LOGGER.error(`Error on {version} extraction: {error}`, {
      version,
      error,
    });
    return Promise.reject(error);
  }
}

async function downloadJarFile(url: string, version: string) {
  const res = await fetch(url);
  const file = await Deno.open(`${TEMP_DIR}/${version}.jar`, {
    create: true,
    write: true,
  });
  await res.body?.pipeTo(file.writable);
  // file.close();

  LOGGER.debug(`Downloaded {version}.jar from {url}`, { version, url });
  return Promise.resolve(true);
}

async function extractJarFile(version: string): Promise<Deno.CommandStatus> {
  const jar = `${TEMP_DIR}/${version}.jar`;
  const cwd = `${TEMP_DIR}/${version}_decompress`;

  // It's cursed...
  LOGGER.debug(`Create jar extract directory: {cwd}`, { cwd });
  await Deno.mkdir(cwd, { recursive: true });
  const command = new Deno.Command("jar", {
    cwd: cwd,
    args: ["xvf", jar, "version.json"],
  });
  const process = command.spawn();
  const output = await process.output();
  LOGGER.debug(`Extract output: {output}`, { output });

  const status = await process.status;

  if (!status.success) {
    LOGGER.error(`Failed to extract {version}.jar`, { version });
    return Promise.reject(status);
  }
  return Promise.resolve(status);
}
