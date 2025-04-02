import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password_hash: string;

  @Column({ type: "varchar" })
  first_name: string;

  @Column({ type: "varchar" })
  last_name: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({
    type: "enum",
    enum: ["admin", "operator", "technician", "client"],
    default: "technician",
  })
  role: "admin" | "operator" | "technician" | "client";

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "created_by" })
  created_by: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updated_by" })
  updated_by: User | null;

  // Relaciones inversas que se definirán cuando creemos las otras entidades
  @OneToMany(() => User, (user) => user.created_by)
  created_users: User[];

  @OneToMany(() => User, (user) => user.updated_by)
  updated_users: User[];

  // Métodos de utilidad
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  toJSON(): Partial<User> {
    const { password_hash, ...user } = this;
    return user;
  }
}
