import * as migration_20251028_103425 from './20251028_103425';
import * as migration_20251204_092829_refacto from './20251204_092829_refacto';

export const migrations = [
  {
    up: migration_20251028_103425.up,
    down: migration_20251028_103425.down,
    name: '20251028_103425',
  },
  {
    up: migration_20251204_092829_refacto.up,
    down: migration_20251204_092829_refacto.down,
    name: '20251204_092829_refacto'
  },
];
