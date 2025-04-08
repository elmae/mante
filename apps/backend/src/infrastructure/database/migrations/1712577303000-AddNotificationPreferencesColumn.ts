import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationPreferencesColumn1712577303000 implements MigrationInterface {
  name = 'AddNotificationPreferencesColumn1712577303000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregamos la columna notification_preferences como JSONB con un valor por defecto
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "notification_preferences" JSONB NOT NULL DEFAULT '{
                "email_notifications": true,
                "in_app_notifications": true,
                "push_notifications": false
            }'
        `);

    // Agregamos una restricción de check para validar la estructura JSON
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "ck_users_notification_preferences_structure" 
            CHECK (
                jsonb_typeof(notification_preferences) = 'object'
                AND notification_preferences ? 'email_notifications'
                AND notification_preferences ? 'in_app_notifications'
                AND notification_preferences ? 'push_notifications'
                AND jsonb_typeof(notification_preferences->'email_notifications') = 'boolean'
                AND jsonb_typeof(notification_preferences->'in_app_notifications') = 'boolean'
                AND jsonb_typeof(notification_preferences->'push_notifications') = 'boolean'
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminamos primero la restricción
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP CONSTRAINT "ck_users_notification_preferences_structure"
        `);

    // Luego eliminamos la columna
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "notification_preferences"
        `);
  }
}
