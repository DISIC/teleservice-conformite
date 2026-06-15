import * as migration_20260615_090827_baseline from './20260615_090827_baseline';

export const migrations = [
  {
    up: migration_20260615_090827_baseline.up,
    down: migration_20260615_090827_baseline.down,
    name: '20260615_090827_baseline'
  },
];
