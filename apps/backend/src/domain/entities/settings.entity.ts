import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';

export enum SettingScope {
  GLOBAL = 'global',
  NOTIFICATION = 'notification',
  SLA = 'sla',
  SYSTEM = 'system'
}

export enum SettingDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json'
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: SettingScope,
    default: SettingScope.GLOBAL
  })
  scope: SettingScope;

  @Column({
    type: 'enum',
    enum: SettingDataType,
    default: SettingDataType.STRING
  })
  data_type: SettingDataType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'uuid' })
  updated_by_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  // Método de ayuda para convertir el valor al tipo de dato correcto
  getValue(): any {
    switch (this.data_type) {
      case SettingDataType.NUMBER:
        return Number(this.value);
      case SettingDataType.BOOLEAN:
        return this.value === 'true';
      case SettingDataType.JSON:
        return JSON.parse(this.value);
      default:
        return this.value;
    }
  }

  // Método de ayuda para establecer el valor con el tipo correcto
  setValue(value: any): void {
    switch (this.data_type) {
      case SettingDataType.JSON:
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  }
}
