export interface IBiller {
    providerId: string;
    productId: string;
    info: string;
    productDisplayName: string;
    providerLogoUrl: string;
    categoryId: string;
    categoryName: string;
    isCasaRequired: string;
    billRepresentmentStatus: string;
}

export interface IBillerRes {
    responseCode: string;
    responseMessage: string;
    billerProviders: IBiller[];
}

export enum EnumBillerCatType {
    // eslint-disable-next-line no-unused-vars
    all = 'all',
    // eslint-disable-next-line no-unused-vars
    electricity = 'electricity',
    // eslint-disable-next-line no-unused-vars
    water = 'water',
}

export interface IBillerCat {
    categoryId: string;
    categoryName: string;
}
