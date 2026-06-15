import * as migration_20260615_090827_baseline from './20260615_090827_baseline';
import * as migration_20260615_092832_drop_audit_is_realised_default from './20260615_092832_drop_audit_is_realised_default';
import * as migration_20260615_134751 from './20260615_134751';

export const migrations = [
  {
    up: migration_20260615_090827_baseline.up,
    down: migration_20260615_090827_baseline.down,
    name: '20260615_090827_baseline',
  },
  {
    up: migration_20260615_092832_drop_audit_is_realised_default.up,
    down: migration_20260615_092832_drop_audit_is_realised_default.down,
    name: '20260615_092832_drop_audit_is_realised_default',
  },
  {
    up: migration_20260615_134751.up,
    down: migration_20260615_134751.down,
    name: '20260615_134751'
  },
];
