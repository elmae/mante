import { Setting } from '../../../../domain/entities/settings.entity';
import { CreateSettingDto } from '../../dtos/create-setting.dto';
import { UpdateSettingDto } from '../../dtos/update-setting.dto';

export interface SettingsRepositoryPort {
  save(setting: Setting): Promise<Setting>;
  create(createSettingDto: CreateSettingDto, userId: string): Promise<Setting>;
  update(id: string, updateSettingDto: UpdateSettingDto, userId: string): Promise<Setting>;
  findAll(): Promise<Setting[]>;
  findById(id: string): Promise<Setting | null>;
  findByKey(key: string): Promise<Setting | null>;
  findByScope(scope: string): Promise<Setting[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByKey(key: string): Promise<boolean>;
  activate(id: string, userId: string): Promise<void>;
  deactivate(id: string, userId: string): Promise<void>;

  // Métodos específicos para settings
  bulkSave(settings: Setting[]): Promise<Setting[]>;
  findByKeys(keys: string[]): Promise<Setting[]>;
  findByScopeAndKeys(scope: string, keys: string[]): Promise<Setting[]>;
}
