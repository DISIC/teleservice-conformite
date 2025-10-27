import * as migration_20251027_104523 from './20251027_104523';
import * as migration_20251027_135411 from './20251027_135411';

export const migrations = [
  {
    up: migration_20251027_104523.up,
    down: migration_20251027_104523.down,
    name: '20251027_104523',
  },
  {
    up: migration_20251027_135411.up,
    down: migration_20251027_135411.down,
    name: '20251027_135411'
  },
];
