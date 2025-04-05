import { Setting, SettingDataType } from '../../../../domain/entities/settings.entity';
import { CreateSettingDto, CreateSettingResponseDto } from '../../dtos/create-setting.dto';
import { UpdateSettingDto, UpdateSettingResponseDto } from '../../dtos/update-setting.dto';
import { SettingsPort } from '../../ports/input/settings.port';
import { SettingsRepositoryPort } from '../../ports/output/settings-repository.port';

export class SettingsService implements SettingsPort {
  constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

  async create(
    createSettingDto: CreateSettingDto,
    userId: string
  ): Promise<CreateSettingResponseDto> {
    const keyExists = await this.settingsRepository.existsByKey(createSettingDto.key);
    if (keyExists) {
      throw new Error('Setting key already exists');
    }

    const setting = await this.settingsRepository.create(createSettingDto, userId);
    return this.mapToCreateResponse(setting);
  }

  async update(
    id: string,
    updateSettingDto: UpdateSettingDto,
    userId: string
  ): Promise<UpdateSettingResponseDto> {
    const exists = await this.settingsRepository.exists(id);
    if (!exists) {
      throw new Error('Setting not found');
    }

    const setting = await this.settingsRepository.update(id, updateSettingDto, userId);
    return this.mapToUpdateResponse(setting);
  }

  async findAll(): Promise<Setting[]> {
    return this.settingsRepository.findAll();
  }

  async findById(id: string): Promise<Setting> {
    const setting = await this.settingsRepository.findById(id);
    if (!setting) {
      throw new Error('Setting not found');
    }
    return setting;
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settingsRepository.findByKey(key);
  }

  async findByScope(scope: string): Promise<Setting[]> {
    return this.settingsRepository.findByScope(scope);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.settingsRepository.exists(id);
    if (!exists) {
      throw new Error('Setting not found');
    }
    await this.settingsRepository.delete(id);
  }

  async activate(id: string, userId: string): Promise<void> {
    const exists = await this.settingsRepository.exists(id);
    if (!exists) {
      throw new Error('Setting not found');
    }
    await this.settingsRepository.activate(id, userId);
  }

  async deactivate(id: string, userId: string): Promise<void> {
    const exists = await this.settingsRepository.exists(id);
    if (!exists) {
      throw new Error('Setting not found');
    }
    await this.settingsRepository.deactivate(id, userId);
  }

  async getValue(key: string): Promise<any> {
    const setting = await this.settingsRepository.findByKey(key);
    if (!setting) {
      return null;
    }
    return setting.getValue();
  }

  async getValuesByScope(scope: string): Promise<Record<string, any>> {
    const settings = await this.settingsRepository.findByScope(scope);
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.getValue();
        return acc;
      },
      {} as Record<string, any>
    );
  }

  async bulkUpdate(settings: { key: string; value: any }[], userId: string): Promise<void> {
    const keys = settings.map(s => s.key);
    const existingSettings = await this.settingsRepository.findByKeys(keys);

    const settingsMap = new Map(existingSettings.map(s => [s.key, s]));
    const updatedSettings = settings.map(({ key, value }) => {
      const setting = settingsMap.get(key);
      if (!setting) {
        throw new Error(`Setting with key ${key} not found`);
      }
      setting.setValue(value);
      setting.updated_by_id = userId;
      return setting;
    });

    await this.settingsRepository.bulkSave(updatedSettings);
  }

  private mapToCreateResponse(setting: Setting): CreateSettingResponseDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      scope: setting.scope,
      data_type: setting.data_type,
      description: setting.description,
      is_active: setting.is_active,
      created_at: setting.created_at,
      updated_at: setting.updated_at,
      created_by_id: setting.created_by_id,
      updated_by_id: setting.updated_by_id
    };
  }

  private mapToUpdateResponse(setting: Setting): UpdateSettingResponseDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      scope: setting.scope,
      data_type: setting.data_type,
      description: setting.description,
      is_active: setting.is_active,
      updated_at: setting.updated_at,
      updated_by_id: setting.updated_by_id
    };
  }
}
