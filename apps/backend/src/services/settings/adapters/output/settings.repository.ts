import { Repository, In } from 'typeorm';
import { Setting, SettingScope } from '../../../../domain/entities/settings.entity';
import { CreateSettingDto } from '../../dtos/create-setting.dto';
import { UpdateSettingDto } from '../../dtos/update-setting.dto';
import { SettingsRepositoryPort } from '../../ports/output/settings-repository.port';

export class SettingsRepository implements SettingsRepositoryPort {
  constructor(private readonly repository: Repository<Setting>) {}

  async save(setting: Setting): Promise<Setting> {
    return this.repository.save(setting);
  }

  async create(createSettingDto: CreateSettingDto, userId: string): Promise<Setting> {
    const setting = this.repository.create({
      ...createSettingDto,
      created_by_id: userId,
      updated_by_id: userId
    });
    return this.repository.save(setting);
  }

  async update(id: string, updateSettingDto: UpdateSettingDto, userId: string): Promise<Setting> {
    await this.repository.update(id, {
      ...updateSettingDto,
      updated_by_id: userId
    });
    return this.findById(id) as Promise<Setting>;
  }

  async findAll(): Promise<Setting[]> {
    return this.repository.find({
      relations: ['created_by', 'updated_by'],
      order: {
        scope: 'ASC',
        key: 'ASC'
      }
    });
  }

  async findById(id: string): Promise<Setting | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['created_by', 'updated_by']
    });
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.repository.findOne({
      where: { key },
      relations: ['created_by', 'updated_by']
    });
  }

  async findByScope(scope: SettingScope): Promise<Setting[]> {
    return this.repository.find({
      where: { scope },
      relations: ['created_by', 'updated_by'],
      order: { key: 'ASC' }
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByKey(key: string): Promise<boolean> {
    const count = await this.repository.count({ where: { key } });
    return count > 0;
  }

  async activate(id: string, userId: string): Promise<void> {
    await this.repository.update(id, {
      is_active: true,
      updated_by_id: userId
    });
  }

  async deactivate(id: string, userId: string): Promise<void> {
    await this.repository.update(id, {
      is_active: false,
      updated_by_id: userId
    });
  }

  async bulkSave(settings: Setting[]): Promise<Setting[]> {
    return this.repository.save(settings);
  }

  async findByKeys(keys: string[]): Promise<Setting[]> {
    return this.repository.find({
      where: { key: In(keys) },
      relations: ['created_by', 'updated_by']
    });
  }

  async findByScopeAndKeys(scope: SettingScope, keys: string[]): Promise<Setting[]> {
    return this.repository.find({
      where: {
        scope,
        key: In(keys)
      },
      relations: ['created_by', 'updated_by']
    });
  }
}
