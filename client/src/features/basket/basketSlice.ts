import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Basket } from "../../app/models/basket";
import agent from "../../app/api/agent";

interface BasketState {
    basket: Basket | null;
    status: string;
}

const initialState: BasketState = {
    basket: null,
    status: 'idle'
}

// The [createAsyncThunk()] will [create] [actions] to do [stuff] in our [store]!!!!!!!!!
// The [createAsyncThunk()] [needs] [(3) paramaters]!!!!!
// The [First] [param] is what [type] are we [returning]. In this [case] is a [Basket]
// The [Second] [param] is the [agruments] [type]. What are [going] to [return] In this [case] is the [{productId: number, quantity: number}]
// The [Third] [param] is just that we have to [return]
////////////////////////////////////////////////////////////////
// The [createAsyncThunk] is like an [Outer Function]
// And what's [happening] [inside] is an [Inner function]. And in there we are [catching] the [error] [inside]
export const addBasketItemAsync = createAsyncThunk<Basket, {productId: number, quantity?: number}>(
    'basket/addBasketItemAsync',
    async ({productId, quantity = 1}, thunkAPI) => {
        try {
            return await agent.Basket.addItem(productId, quantity);
        } catch (error: any) {
            // This will the [Error Handling] for the [Inner function]. Continue DownVV
            // And all of the [Function] will [Rejected] And Not [fulfilled]!!!
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

// The [createAsyncThunk] is like an [Outer Function]
// And what's [happening] [inside] is an [Inner function]. And in there we are [catching] the [error] [inside]
export const removeBasketItemAsync = createAsyncThunk<void, {productId: number, quantity: number, name?: string}>(
    'basket/removeBasketItemASync',
    async ({productId, quantity}, thunkAPI) => {
        try {
            await agent.Basket.removeItem(productId, quantity);
        } catch (error: any) {
            // This will the [Error Handling] for the [Inner function]. Continue DownVV
            // And all of the [Function] will [Rejected] And Not [fulfilled]!!!
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)


export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        // The [basket] will [first] be [Initialze] in the [App.tsx]. Continue DownVV
        // In the [UseEffect()] when we call the [dispatch(setBasket())] and [PASS] in the [basket]
        setBasket: (state, action) => {
            state.basket = action.payload
        }     
    },
    extraReducers: (builder => {
        // When the [addBasketItemAsync] [function] from [above] will be [called] will [make it] a [pending]
        builder.addCase(addBasketItemAsync.pending, (state, action) => {
            console.log(action);
            state.status = 'pendingAddItem' + action.meta.arg.productId;
        });

        // When the [addBasketItemAsync] [function] from [above] will be [finished]. Continue DownVV
        // will [set] the [basket] for what we [getting] in the [return] of the [addBasketItemAsync] [function]
        builder.addCase(addBasketItemAsync.fulfilled, (state, action) => {
            state.basket = action.payload;
            state.status = 'idle';
        });

        builder.addCase(addBasketItemAsync.rejected, (state, action) => {
            console.log(action.payload);
            state.status = 'idle';
        });

        // This Where the [removeBasketItem] Start!!!!!!!!!!!!!!!!!
        builder.addCase(removeBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        });

        builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
            const { productId, quantity } = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex === -1 || itemIndex === undefined) {
                return;
            }

            state.basket!.items[itemIndex].quantity -= quantity;

            if (state.basket!.items[itemIndex].quantity === 0) {
                state.basket?.items.splice(itemIndex, 1);
            }
            state.status = 'idle';
        });

        builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });

    })
})

export const {setBasket} = basketSlice.actions;