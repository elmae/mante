import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { SettingScope, SettingDataType } from '../../../domain/entities/settings.entity';

export class CreateSettingsTable1711110000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'key',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'value',
            type: 'text'
          },
          {
            name: 'scope',
            type: 'enum',
            enum: Object.values(SettingScope),
            default: `'${SettingScope.GLOBAL}'`
          },
          {
            name: 'data_type',
            type: 'enum',
            enum: Object.values(SettingDataType),
            default: `'${SettingDataType.STRING}'`
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
          },
          {
            name: 'created_by_id',
            type: 'uuid'
          },
          {
            name: 'updated_by_id',
            type: 'uuid'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'settings',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION'
      })
    );

    await queryRunner.createForeignKey(
      'settings',
      new TableForeignKey({
        columnNames: ['updated_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('settings');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('settings', foreignKey);
      }
    }
    await queryRunner.dropTable('settings');
  }
}
