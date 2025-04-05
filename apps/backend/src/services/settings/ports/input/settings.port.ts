import { Setting } from '../../../../domain/entities/settings.entity';
import { CreateSettingDto, CreateSettingResponseDto } from '../../dtos/create-setting.dto';
import { UpdateSettingDto, UpdateSettingResponseDto } from '../../dtos/update-setting.dto';

export interface SettingsPort {
  create(createSettingDto: CreateSettingDto, userId: string): Promise<CreateSettingResponseDto>;
  update(
    id: string,
    updateSettingDto: UpdateSettingDto,
    userId: string
  ): Promise<UpdateSettingResponseDto>;
  findAll(): Promise<Setting[]>;
  findById(id: string): Promise<Setting>;
  findByKey(key: string): Promise<Setting | null>;
  findByScope(scope: string): Promise<Setting[]>;
  delete(id: string): Promise<void>;
  activate(id: string, userId: string): Promise<void>;
  deactivate(id: string, userId: string): Promise<void>;

  // Métodos específicos para settings
  getValue(key: string): Promise<any>;
  getValuesByScope(scope: string): Promise<Record<string, any>>;
  bulkUpdate(settings: { key: string; value: any }[], userId: string): Promise<void>;
}
