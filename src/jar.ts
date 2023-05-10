import { STORE_DIR, TEMP_DIR } from "./static.ts";
import { getLogger } from "https://deno.land/std@0.186.0/log/mod.ts";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";
import { checkStoreDirAndCreate } from "./utils.ts";
import { downloadClientManifest } from "./manifest.ts";

const LOGGER = getLogger();

export async function extractData(client_url: string, version: string): Promise<boolean> {
  try {
    LOGGER.info(`Download ${version} data from ${client_url}...`);
    const data = await downloadClientManifest(client_url);
    const url = data.downloads.client.url

    LOGGER.info(`Download ${version}.jar from ${url}...`)
    await downloadJarFile(url, version);

    LOGGER.info(`Extract ${version}.jar file...`);
    const extract = await extractJarFile(version);
    LOGGER.info(`Java process exited with ${extract.code}`);

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
  } catch (e) {
    LOGGER.error(`Error on ${version}`);
    LOGGER.error(e)
    return Promise.reject(false);
  }
}

async function downloadJarFile(url: string, version: string) {
  const res = await fetch(url);
  const file = await Deno.open(`${TEMP_DIR}/${version}.jar`, {
    create: true,
    write: true,
  });

  await res.body?.pipeTo(file.writable);
}

async function extractJarFile(version: string): Promise<Deno.CommandStatus> {
  const jar = `${TEMP_DIR}/${version}.jar`;
  const cwd = `${TEMP_DIR}/${version}_decompress`;
  
  // It's cursed...
  await Deno.mkdir(cwd, {recursive: true} );
  const command = new Deno.Command("java", {
    cwd: cwd,
    args: ["xvf", jar, "version.json"]
  })
  const process = command.spawn();
  await process.output();
  return Promise.resolve(process.status);
}
