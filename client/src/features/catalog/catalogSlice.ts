import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Product, ProductParams } from "../../app/models/product";
import agent from "../../app/api/agent";
import { RootState } from "../../app/store/configureStore";
import { MetaData } from "../../app/models/pagination";


interface CatalogState {
    productsLoaded: boolean;
    filtersLoaded: boolean;
    status: string;
    brands: string[];
    types: string[];
    productParams: ProductParams;
    metaData: MetaData | null ;
}


// This will let us [Store] are [collection]. In [this case] are [Products]
// It will [Store] [them] in [arrays] of [Ids] and [Entities]
const productsAdapter = createEntityAdapter<Product>();

// Here I'm [creating] the [URLSearchParams] to [PASS] it ass an [argument] to the [list()] [Function] in the [fetchProductsAsync] Below VVV.
// Continue ^^ Which will then [pass them] to the [API] in the [ProductsController] in the [Get Product] [Function]
function getAxiosParams(productParams: ProductParams) {
    const params = new URLSearchParams();
    // Here I'm [adding/appending] [Each Value] with a [Name]
    // For [Example] this one VV will be like this -> ["pageNumber?1"]. The (1) is the [Value] from [productParams.pageNumber]
    params.append('pageNumber', productParams.pageNumber.toString());
    params.append('pageSize', productParams.pageSize.toString());
    params.append('orderBy', productParams.orderBy);

    if (productParams.searchTerm) {
        params.append('searchTerm', productParams.searchTerm);
    }

    if (productParams.brands.length > 0) {
        params.append('brands', productParams.brands.toString());
    }

    if (productParams.types.length > 0) {
        params.append('types', productParams.types.toString());
    }
    return params;
}

// The [createAsyncThunk] is like an [Outer Function]
// And what's [happening] [inside] is an [Inner function]. And in there we are [catching] the [error] [inside]
export const fetchProductsAsync = createAsyncThunk<Product[], void, {state: RootState}>(
    'catalog/fetchProductsAsync',
    // The [_] is [none existent argument] because [we need] are [thunkAPI] to be the [second argument]
    async (_, thunkAPI) => {
        // Here I'm [PASSING] the [state -> productParams] to the [function] [getAxiosParams()].
        const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
        try {
            // Here I'm [PASSING] all the [arguments/params] to the [list() function] Which will then [pass them] to the [API] in the [ProductsController] in the [Get Product] [Function]
            var response = await agent.Catalog.list(params);
            thunkAPI.dispatch(setMetaData(response.metaData));
            return response.items;
        } catch (error: any) {
            // This will the [Error Handling] for the [Inner function]. Continue DownVV
            // And all of the [Function] will [Rejected] And Not [fulfilled]!!!
            thunkAPI.rejectWithValue({ error: error.data });
        }
    }
)

// The [createAsyncThunk] is like an [Outer Function]
// And what's [happening] [inside] is an [Inner function]. And in there we are [catching] the [error] [inside]
export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try {
            const product = await agent.Catalog.details(productId);
            return product;
        } catch (error: any) {
            // This will the [Error Handling] for the [Inner function]. Continue DownVV
            // And all of the [Function] will [Rejected] And Not [fulfilled]!!!
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
)


export const fetchFilters = createAsyncThunk(
    'catalog/fetchFilters',
    async (_, thunkAPI) => {
        try {
            return agent.Catalog.fetchFilters();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
)


function initParams(): ProductParams {
    return {
        pageNumber: 1,
        pageSize: 6,
        orderBy: 'name',
        brands: [],
        types: []
    }
}


export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: productsAdapter.getInitialState<CatalogState>({
        productsLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands: [],
        types: [],
        productParams: initParams(),
        metaData: null
    }),
    reducers: {
        setProductParams: (state, action) => {
            state.productsLoaded = false;
            state.productParams = { ...state.productParams, ...action.payload, pageNumber: 1 };
        },

        setPageNumber: (state, action) => {
            state.productsLoaded = false;
            state.productParams = { ...state.productParams, ...action.payload };
        },
        
        setMetaData: (state, action) => {
            state.metaData = action.payload;         
        },

        resetProductParams: (state) => {
            state.productParams = initParams()
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.status = 'pendingFetchProducts';
        });

        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            // Here will [set/store] all of are [Produts] in the [productsAdapter]
            // The [state] will be are [Ids]. And the [action.payload] will be are [Entities]
            productsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });

        builder.addCase(fetchProductsAsync.rejected, (state, action) => {
            console.log(action.payload);
            state.status = 'idle';
        });

        //From here is the [Product] Not The [Products]!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        builder.addCase(fetchProductAsync.pending, (state) => {
            state.status = 'pendingFetchProduct';
        });

        builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
            // Here will [set/store] [1] of are [Produts] in the [productsAdapter]
            // The [state] will be are [Ids]. And the [action.payload] will be are [Entities]
            productsAdapter.upsertOne(state, action.payload);
            state.status = 'idle';
        });

        builder.addCase(fetchProductAsync.rejected, (state, action) => {
            console.log(action);
            state.status = 'idle';
        });

        //From here is the [Filters] Not The [Product]!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        builder.addCase(fetchFilters.pending, (state) => {
            state.status = 'pendingFetchFilters';
        });

        builder.addCase(fetchFilters.fulfilled, (state, action) => {
            state.brands = action.payload.brands;
            state.types = action.payload.types;
            state.status = 'idle'
            state.filtersLoaded = true;
        });

        builder.addCase(fetchFilters.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
    })
})

// With this i'll be [able] to [get] are [data] from the [store]!!!
// This will give us [diffrent] [types] of [Selectors]. Like [selectById], [selectAll], [selectEntities]
export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog);
export const { setProductParams, resetProductParams, setMetaData, setPageNumber } = catalogSlice.actions;
