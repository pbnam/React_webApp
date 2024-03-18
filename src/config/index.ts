export enum BuildVariants {
    // eslint-disable-next-line no-unused-vars
    DEVELOPMENT = 'DEVELOPMENT',
    // eslint-disable-next-line no-unused-vars
    PRODUCTION = 'PRODUCTION',
    // eslint-disable-next-line no-unused-vars
    UAT = 'UAT',
    // eslint-disable-next-line no-unused-vars
    SIT = 'SIT',
}

export type BuildVariantsType = 'DEVELOPMENT' | 'PRODUCTION' | 'UAT' | 'SIT';

//Private method to load env config dynamically
const _loadEnvConfig = (env: BuildConfig) => {
    switch (env) {
        case BuildVariants.DEVELOPMENT:
            return require(`./dev`);

        case BuildVariants.UAT:
            return require(`./uat`);

        case BuildVariants.SIT:
            return require(`./sit`);

        default:
            return require(`./production`);
    }
};

/**
 * Project Build Configuration class
 * Get environment and Run time configuration from `BuildConfig` class
 *
 * @class BuildConfig
 */
export default class BuildConfig {
    static _buildConfig: any;

    /**
     * Initialize BuildConfig to load env config based on `process.env.REACT_APP_ENV`
     * Read env config and set it to `_buildConfig` property
     *
     * @method init
     */
    static init(env: BuildVariantsType) {
        if (!env) {
            throw new Error('Environment type can not be blank / null');
        }
        this._buildConfig = _loadEnvConfig(env);
    }

    static get BASE_URL() {
        return this._buildConfig?.default.HOST;
    }
}
