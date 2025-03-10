import ProgressBar from "@deno-library/progress";

export interface ProgressConfig {
  title?: string;
  width?: number;
  complete?: string;
  preciseBar?: string[];
  incomplete?: string;
  clear?: boolean;
  interval?: number;
  display?: string;
  prettyTime?: boolean;
  output?: typeof Deno.stdout | typeof Deno.stderr;
}

/**
 * Processes an array of promises, updating a progress bar
 * as each promise resolves.
 *
 * @param promises - an array of Promise<any>
 * @returns a Promise that resolves with an array of resolved values.
 */
export function trackPromises<T>(
  promises: Promise<T>[],
  progressBarConfig: ProgressConfig = {}
): Promise<PromiseSettledResult<T>[]> {
  const total = promises.length;
  const progress = new ProgressBar({
    total,
    ...progressBarConfig,
  });
  let count = 0;

  // Wrap each promise to update progress when done
  const wrappedPromises: Promise<T>[] = [];
  for (const p of promises) {
    wrappedPromises.push(
      p
        .then((result) => {
          return result;
        })
        .catch(async (error) => {
          await progress.console(`Error: ${error}`);
          return error;
        })
        .finally(async () => {
          count++;
          await progress.render(count);
        })
    );
  }

  return Promise.allSettled(wrappedPromises);
}
