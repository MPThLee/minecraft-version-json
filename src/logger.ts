import { configure, getConsoleSink } from "@logtape/logtape";

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: "minecraft-version-json",
      lowestLevel: "debug",
      sinks: ["console"],
    },
  ],
});
