/** Minimal browser stub for path helpers used by sqldesc schema loading. */
const path = {
  join(...parts: string[]): string {
    return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
  },
  resolve(...parts: string[]): string {
    return path.join(...parts);
  },
  dirname(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const index = normalized.lastIndexOf("/");
    return index <= 0 ? "." : normalized.slice(0, index);
  },
};

export default path;
