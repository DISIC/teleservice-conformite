import * as migration_20251027_100910 from './20251027_100910';

export const migrations = [
  {
    up: migration_20251027_100910.up,
    down: migration_20251027_100910.down,
    name: '20251027_100910'
  },
];
