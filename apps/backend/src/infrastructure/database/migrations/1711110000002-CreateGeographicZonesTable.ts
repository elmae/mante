import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGeographicZonesTable1711110000002 implements MigrationInterface {
  name = 'CreateGeographicZonesTable1711110000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension for geographic data
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

    await queryRunner.query(`
            CREATE TABLE "geographic_zones" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "area" geometry(POLYGON, 4326),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_geographic_zones" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "geographic_zones"
            ADD CONSTRAINT "fk_geographic_zones_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "geographic_zones"
            ADD CONSTRAINT "fk_geographic_zones_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_geographic_zones_name" ON "geographic_zones"("name");
            CREATE INDEX "ix_geographic_zones_area" ON "geographic_zones" USING GIST ("area");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_geographic_zones_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_geographic_zones_area"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "geographic_zones" DROP CONSTRAINT "fk_geographic_zones_updated_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "geographic_zones" DROP CONSTRAINT "fk_geographic_zones_created_by"`
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "geographic_zones"`);
  }
}
