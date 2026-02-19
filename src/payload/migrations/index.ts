import * as migration_20260129_145330 from './20260129_145330';
import * as migration_20260202_152711_create_declaration_from_url from './20260202_152711_create_declaration_from_url';
import * as migration_20260202_171943_change_test_environments_field from './20260202_171943_change_test_environments_field';
import * as migration_20260204_093440_add_published_content from './20260204_093440_add_published_content';
import * as migration_20260212_132442_update_audit_fields from './20260212_132442_update_audit_fields';
import * as migration_20260219_132340 from './20260219_132340';

export const migrations = [
  {
    up: migration_20260129_145330.up,
    down: migration_20260129_145330.down,
    name: '20260129_145330',
  },
  {
    up: migration_20260202_152711_create_declaration_from_url.up,
    down: migration_20260202_152711_create_declaration_from_url.down,
    name: '20260202_152711_create_declaration_from_url',
  },
  {
    up: migration_20260202_171943_change_test_environments_field.up,
    down: migration_20260202_171943_change_test_environments_field.down,
    name: '20260202_171943_change_test_environments_field',
  },
  {
    up: migration_20260204_093440_add_published_content.up,
    down: migration_20260204_093440_add_published_content.down,
    name: '20260204_093440_add_published_content',
  },
  {
    up: migration_20260212_132442_update_audit_fields.up,
    down: migration_20260212_132442_update_audit_fields.down,
    name: '20260212_132442_update_audit_fields',
  },
  {
    up: migration_20260219_132340.up,
    down: migration_20260219_132340.down,
    name: '20260219_132340'
  },
];
