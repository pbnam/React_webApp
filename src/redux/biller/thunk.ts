import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllBiller } from '../../api/biller';
import { IBiller, IBillerCat } from '../../api/biller/interface';
import { IUniqueReqKey } from '../../api/interface';
import { BPT_BILLER_SUPPORT, POPULAR_BILLER_IDS } from '../../constants';

export const getBillers = createAsyncThunk('biller/get', async (payload: IUniqueReqKey) => {
    return new Promise<any>((resolve, reject) => {
        getAllBiller({
            walletAccountId: payload.walletAccountId,
            merchantSettlementId: payload.merchantSettlementId,
        })
            .then((res) => {
                try {
                    const allBillers = res.billerProviders.filter((biller) => BPT_BILLER_SUPPORT.includes(biller.categoryName));
                    const values = allBillers.map((item) => ({
                        categoryName: item.categoryName,
                        categoryId: item.categoryId,
                    }));

                    const billerCat: IBillerCat[] = [];
                    for (let value of values) {
                        if (!JSON.stringify(billerCat).includes(value.categoryName)) {
                            billerCat.push(value);
                        }
                    }

                    const popularBillers: IBiller[] = [];

                    POPULAR_BILLER_IDS.forEach((id) => {
                        const currentBiller = allBillers.find((item) => item.productId === id);
                        currentBiller && popularBillers.push(currentBiller);
                    });
                    resolve({ allBillers, popularBillers, billerCat });
                } catch (error) {
                    reject();
                }
            })
            .catch((e) => reject(e));
    });
});
