"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const config_1 = require("@nestjs/config");
const configService = new config_1.ConfigService;
exports.DatabaseConfig = {
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
exports.default = exports.DatabaseConfig;
//# sourceMappingURL=dataBaseConfig.js.map