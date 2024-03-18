import { AxiosError } from 'axios';
import moment from 'moment';

import { IBillRes, patchBillApi } from '..';
import { FORMAT_DATE_VN } from '../../../constants';
import { DEFAULT_FIELD_INVALID } from '../../../constants/errorCode';
import { checkingBillType, convertArrayToObject, convertData } from '../../../utils/common';
import { IErrorApi, IErrorPayloadBoostWallet } from '../../interface';
import { getDefaultFieldBill, IDataToGetDefaultField } from '../default-field';

// compare and update bill data to sync up with boostLife
interface IhandleCompareBill {
    params: IDataToGetDefaultField;
    currentData: IBillRes;
}

const handleCompareBill = async ({ params, currentData }: IhandleCompareBill) => {
    let hasUpdate = false;

    try {
        const oldData = {
            outstandingAmount: currentData.outstandingAmount,
            payAmount: currentData.payAmount,
            dueDate: currentData.dueDate ? moment(new Date(currentData.dueDate as string)).format(FORMAT_DATE_VN) : null,
        };

        const responseData = await getDefaultFieldBill(params)
            .then((res) => convertArrayToObject(res.fields))
            .catch((err: AxiosError) => {
                let errorData = err.response?.data as IErrorApi<IErrorPayloadBoostWallet>;
                return errorData && errorData?.errorPayload?.responseCode === DEFAULT_FIELD_INVALID ? DEFAULT_FIELD_INVALID : null;
            });

        const newData = {
            outstandingAmount: convertData(responseData?.outstandingAmount),
            payAmount: convertData(responseData?.payAmount),
            dueDate: convertData(responseData?.dueDate),
        };

        if (responseData !== null && JSON.stringify(oldData) !== JSON.stringify(newData)) {
            hasUpdate = true;

            return patchToUpdateBill(currentData.id)
                .then(() => Promise.resolve({ data: currentData, hasUpdate }))
                .catch(() => Promise.resolve({ data: currentData, hasUpdate: false }));
        } else {
            return Promise.resolve({ data: currentData, hasUpdate });
        }
    } catch (error) {
        return Promise.resolve({ data: currentData, hasUpdate });
    }
};

// update to DB
const patchToUpdateBill = (id: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        patchBillApi(id)
            .then(() => resolve(true))
            .catch(() => reject(false));
    });
};

const convertAndCompareNewBills = async (data: IBillRes[], walletAccountId: string, merchantSettlementId: string) => {
    return new Promise<{ data: IBillRes[]; hasUpdate: boolean }>((resolve, reject) => {
        let update = false;
        const newData = data.map(async (item): Promise<IBillRes> => {
            const billData = await handleCompareBill({
                params: {
                    productId: item.productId,
                    categoryId: item.categoryId,
                    accountNumber: item.accountNumber,
                    walletAccountId,
                    merchantSettlementId,
                },
                currentData: item,
            });
            let status = checkingBillType(billData.data.outstandingAmount);
            let hasUpdate = billData.hasUpdate;

            if (hasUpdate) {
                update = hasUpdate;
            }
            return { ...billData.data, status };
        });
        Promise.all(newData).then((res) => {
            resolve({ data: res, hasUpdate: update });
        });
    });
};

export default convertAndCompareNewBills;
