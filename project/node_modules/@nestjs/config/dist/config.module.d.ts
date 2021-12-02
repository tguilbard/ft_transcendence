import { DynamicModule } from '@nestjs/common';
import { ConfigFactory, ConfigModuleOptions } from './interfaces';
export declare class ConfigModule {
    /**
     * Loads process environment variables depending on the "ignoreEnvFile" flag and "envFilePath" value.
     * Also, registers custom configurations globally.
     * @param options
     */
    static forRoot(options?: ConfigModuleOptions): DynamicModule;
    /**
     * Registers configuration object (partial registration).
     * @param config
     */
    static forFeature(config: ConfigFactory): DynamicModule;
    private static loadEnvFile;
    private static assignVariablesToProcess;
    private static mergePartial;
    private static getSchemaValidationOptions;
}
