import * as migration_20260520_120228 from './20260520_120228';

export const migrations = [
  {
    up: migration_20260520_120228.up,
    down: migration_20260520_120228.down,
    name: '20260520_120228'
  },
];
