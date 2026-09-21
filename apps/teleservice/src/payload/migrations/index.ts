import * as migration_20260615_090827_baseline from './20260615_090827_baseline';
import * as migration_20260615_092832_drop_audit_is_realised_default from './20260615_092832_drop_audit_is_realised_default';
import * as migration_20260615_134751 from './20260615_134751';
import * as migration_20260907_100108_app_kind_optional from './20260907_100108_app_kind_optional';
import * as migration_20260907_125149_first_published_at from './20260907_125149_first_published_at';
import * as migration_20260917_094822_settings_global from './20260917_094822_settings_global';
import * as migration_20260917_122400_faq_answer_richtext from './20260917_122400_faq_answer_richtext';
import * as migration_20260921_090533_first_visited_at from './20260921_090533_first_visited_at';
import * as migration_20260921_142918_blocking_elements from './20260921_142918_blocking_elements';

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
    name: '20260615_134751',
  },
  {
    up: migration_20260907_100108_app_kind_optional.up,
    down: migration_20260907_100108_app_kind_optional.down,
    name: '20260907_100108_app_kind_optional',
  },
  {
    up: migration_20260907_125149_first_published_at.up,
    down: migration_20260907_125149_first_published_at.down,
    name: '20260907_125149_first_published_at',
  },
  {
    up: migration_20260917_094822_settings_global.up,
    down: migration_20260917_094822_settings_global.down,
    name: '20260917_094822_settings_global',
  },
  {
    up: migration_20260917_122400_faq_answer_richtext.up,
    down: migration_20260917_122400_faq_answer_richtext.down,
    name: '20260917_122400_faq_answer_richtext',
  },
  {
    up: migration_20260921_090533_first_visited_at.up,
    down: migration_20260921_090533_first_visited_at.down,
    name: '20260921_090533_first_visited_at',
  },
  {
    up: migration_20260921_142918_blocking_elements.up,
    down: migration_20260921_142918_blocking_elements.down,
    name: '20260921_142918_blocking_elements'
  },
];
