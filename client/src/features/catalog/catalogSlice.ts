import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Product } from "../../app/models/product";
import agent from "../../app/api/agent";
import { RootState } from "../../app/store/configureStore";

// This will let us [Store] are [collection]. In [this case] are [Products]
// It will [Store] [them] in [arrays] of [Ids] and [Entities]
const productsAdapter = createEntityAdapter<Product>();

// The [createAsyncThunk] is like an [Outer Function]
// And what's [happening] [inside] is an [Inner function]. And in there we are [catching] the [error] [inside]
export const fetchProductsAsync = createAsyncThunk<Product[]>(
    'catalog/fetchProductsAsync',
    // The [_] is [none existent argument] because [we need] are [thunkAPI] to be the [second argument]
    async (_, thunkAPI) => {
        try {
            return await agent.Catalog.list();
        } catch (error: any) {
            // This will the [Error Handling] for the [Inner function]. Continue DownVV
            // And all of the [Function] will [Rejected] And Not [fulfilled]!!!
            thunkAPI.rejectWithValue({error: error.data})
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
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)


export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: productsAdapter.getInitialState({
        productsLoaded: false,
        status: 'idle'
    }),
    reducers: {},
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
        
        //From here is the [Product] Not The [Produts]!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
    })
}) 

// With this i'll be [able] to [get] are [data] from the [store]!!!
// This will give us [diffrent] [types] of [Selectors]. Like [selectById], [selectAll], [selectEntities]
export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog);
