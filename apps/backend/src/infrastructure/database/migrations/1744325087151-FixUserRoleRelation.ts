import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserRoleRelation1744325087151 implements MigrationInterface {
  name = 'FixUserRoleRelation1744325087151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add role_id column (nullable temporarily)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "role_id" uuid
    `);

    // 2. Map existing role names to role IDs
    await queryRunner.query(`
      UPDATE "users" u
      SET "role_id" = r.id
      FROM "roles" r
      WHERE u.role = r.name
    `);

    // 3. Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "fk_users_role"
      FOREIGN KEY ("role_id")
      REFERENCES "roles"("id")
      ON DELETE RESTRICT
    `);

    // 4. Make role_id NOT NULL after data migration
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role_id" SET NOT NULL
    `);

    // 5. Drop old role column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "role"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add back old role column
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "role" character varying
    `);

    // 2. Map role_ids back to role names
    await queryRunner.query(`
      UPDATE "users" u
      SET "role" = r.name
      FROM "roles" r
      WHERE u.role_id = r.id
    `);

    // 3. Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "fk_users_role"
    `);

    // 4. Drop role_id column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "role_id"
    `);
  }
}
