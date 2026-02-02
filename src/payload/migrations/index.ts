import * as migration_20260129_145330 from './20260129_145330';
import * as migration_20260202_152711_create_declaration_from_url from './20260202_152711_create_declaration_from_url';

export const migrations = [
  {
    up: migration_20260129_145330.up,
    down: migration_20260129_145330.down,
    name: '20260129_145330',
  },
  {
    up: migration_20260202_152711_create_declaration_from_url.up,
    down: migration_20260202_152711_create_declaration_from_url.down,
    name: '20260202_152711_create_declaration_from_url'
  },
];
