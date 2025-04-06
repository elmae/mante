import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAttachmentsTables1712437509872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabla de adjuntos
    await queryRunner.createTable(
      new Table({
        name: 'attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'ticket_id',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'maintenance_record_id',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'file_name',
            type: 'varchar'
          },
          {
            name: 'file_path',
            type: 'varchar'
          },
          {
            name: 'mime_type',
            type: 'varchar'
          },
          {
            name: 'file_size',
            type: 'bigint'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'created_by_id',
            type: 'uuid'
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'deleted_by_id',
            type: 'uuid',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Tabla de logs de auditoría
    await queryRunner.createTable(
      new Table({
        name: 'file_audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'file_id',
            type: 'uuid'
          },
          {
            name: 'operation',
            type: 'varchar'
          },
          {
            name: 'user_id',
            type: 'uuid'
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['ticket_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tickets',
        onDelete: 'SET NULL'
      })
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['maintenance_record_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'maintenance_records',
        onDelete: 'SET NULL'
      })
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION'
      })
    );

    await queryRunner.createForeignKey(
      'attachments',
      new TableForeignKey({
        columnNames: ['deleted_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION'
      })
    );

    await queryRunner.createForeignKey(
      'file_audit_logs',
      new TableForeignKey({
        columnNames: ['file_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'attachments',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'file_audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION'
      })
    );

    // Índices
    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'idx_attachments_ticket',
        columnNames: ['ticket_id'],
        isUnique: false
      })
    );

    await queryRunner.createIndex(
      'attachments',
      new TableIndex({
        name: 'idx_attachments_maintenance',
        columnNames: ['maintenance_record_id'],
        isUnique: false
      })
    );

    await queryRunner.createIndex(
      'file_audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_file',
        columnNames: ['file_id'],
        isUnique: false
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('attachments', 'idx_attachments_ticket');
    await queryRunner.dropIndex('attachments', 'idx_attachments_maintenance');
    await queryRunner.dropIndex('file_audit_logs', 'idx_audit_logs_file');

    // Eliminar foreign keys (se eliminan automáticamente con las tablas)

    // Eliminar tablas
    await queryRunner.dropTable('file_audit_logs');
    await queryRunner.dropTable('attachments');
  }
}
