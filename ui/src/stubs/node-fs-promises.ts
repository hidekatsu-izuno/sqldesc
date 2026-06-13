/** Browser stub — schema file loading is not used in the web UI. */
export async function glob(): Promise<never[]> {
  return [];
}

export async function readFile(): Promise<string> {
  throw new Error("File system access is not available in the browser.");
}
