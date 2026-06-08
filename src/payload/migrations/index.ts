import * as migration_20260520_120228 from './20260520_120228';
import * as migration_20260608_111306 from './20260608_111306';

export const migrations = [
  {
    up: migration_20260520_120228.up,
    down: migration_20260520_120228.down,
    name: '20260520_120228',
  },
  {
    up: migration_20260608_111306.up,
    down: migration_20260608_111306.down,
    name: '20260608_111306'
  },
];
