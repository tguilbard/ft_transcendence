import { ConfigService } from "@nestjs/config";

const configService = new ConfigService;

export const DatabaseConfig = {
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: parseInt(configService.get('POSTGRES_PORT')),
  username: configService.get('POSTGRES_USERNAME'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DATABASE'),
  entities: ['**/*.entity{.ts,.js}'],
  migrationsTableName: 'migration',
  migrations: ['src/migration/*.ts'],
  cli: {
    migrationsDir: 'src/migration'
  }
  };

  export default DatabaseConfig;