import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOutletApi, IDataToGetOutlet } from '../../../api/bill/outlet';
import { IBillOutlet } from '../../../api/interface';
import { makeid } from '../../../utils/common';

interface ISearchOutletName extends IDataToGetOutlet {
    stores: IBillOutlet[];
}

const searchOutletName = createAsyncThunk('outlet/post', async ({ stores, ...params }: ISearchOutletName) => {
    let availableStore = Array.from(new Set(stores.filter((item) => item.name.toLowerCase().includes((params?.search as string)?.toLowerCase())).map((itemx) => itemx.name)));

    return new Promise<any>((resolve, reject) => {
        getOutletApi(params)
            .then((res) => {
                let resData = Array.from(new Set(res.data.filter((item) => item.type === 'OTHER').map((item) => item.name)));
                let updateData = Array.from(new Set(resData.concat(availableStore))).map((item) => {
                    return {
                        id: makeid(18),
                        name: item,
                    };
                });

                resolve(updateData);
            })
            .catch(() => reject());
    });
});

// updateBillOutletApi
const getAllOutlets = createAsyncThunk('outlets/get', async (params: IDataToGetOutlet) => {
    return new Promise<any>((resolve, reject) => {
        getOutletApi(params)
            .then((res) => resolve(res.data))
            .catch(() => reject());
    });
});

export { searchOutletName, getAllOutlets };
