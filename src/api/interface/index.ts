import { CancelToken } from 'axios';

type IBillerCategoryType = 'ELECTRICITY' | 'WATER';

type IOutletType = 'AVAILABLE' | 'OTHER';

type IReminderType = 'WEEKLY' | 'MONTHLY';

type ITransactionStatusType = 'SUCCESS' | 'FAILED';

interface IBillOutlet {
    name: string;
    outletId: string;
    type: IOutletType;
}

interface IBillReminder {
    dayOfMonth: number;
    dayOfWeek: number;
    period: IReminderType;
}

interface IPinLogPayload {
    isBlocked: boolean | null;
    lastTime: string;
}

interface IErrorPayloadBoostWallet {
    responseCode: string;
    responseMessage: string;
}

interface IErrorPayloadOpenApi {
    error: {
        code: string;
        message: string | null;
    };
}

interface IErrorApi<T> {
    errorCode: string;
    errorMessage: string;
    errorPayload: T;
}

interface IUniqueReqKey {
    walletAccountId: string;
    merchantSettlementId: string;
}

interface IUpdateBillData {
    outstandingAmount: string;
    payAmount: string;
    dueDate: string;
}

interface ICancelToken {
    cancelToken: CancelToken;
}

interface IErrorBillPayment extends Partial<IPinLogPayload>, Partial<IErrorPayloadOpenApi> {}

export {
    IReminderType,
    IOutletType,
    IBillerCategoryType,
    ITransactionStatusType,
    IBillOutlet,
    IBillReminder,
    IErrorApi,
    IErrorPayloadOpenApi,
    IErrorPayloadBoostWallet,
    IPinLogPayload,
    IUniqueReqKey,
    IUpdateBillData,
    IErrorBillPayment,
    ICancelToken,
};
