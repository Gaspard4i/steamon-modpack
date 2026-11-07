import fs from 'node:fs';
import path from 'node:path';

// Persistance JSON atomique : écriture dans un fichier temporaire puis rename.
export function createSnapshotStore(dir, log) {
  const file = path.join(dir, 'state.json');
  const tmp = `${file}.tmp`;
  fs.mkdirSync(dir, { recursive: true });
  let timer = null;
  let pending = null;

  const flush = () => {
    if (!pending) return;
    const data = pending;
    pending = null;
    fs.writeFile(tmp, JSON.stringify(data), (e) => {
      if (e) return log.error({ err: e }, 'snapshot: écriture impossible');
      fs.rename(tmp, file, (e2) => e2 && log.error({ err: e2 }, 'snapshot: rename impossible'));
    });
  };

  return {
    load() {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        return null;
      }
    },
    save(getData) {
      pending = getData();
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        flush();
      }, 1500);
      timer.unref?.();
    },
    flushSync(getData) {
      try {
        fs.writeFileSync(tmp, JSON.stringify(getData()));
        fs.renameSync(tmp, file);
      } catch (e) {
        log.error({ err: e }, 'snapshot: flushSync impossible');
      }
    },
  };
}
