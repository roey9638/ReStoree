import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import ProductList from "./ProductList";
import { useEffect } from "react";
import { fetchProductsAsync, productSelectors } from "./catalogSlice";


export default function Catalog() {

    // Now when we [load] are [Catalog]. All of are [Products] are [Stored] in the [productSelectors]
    // And the [selectAll] will give us a [list] of are [Prodcuts]
    const products = useAppSelector(productSelectors.selectAll);
    const {productsLoaded, status} = useAppSelector(state => state.catalog);
    const dispatch = useAppDispatch();

    // This [useEffect] will be called (Once) when the [Component] first [Mounts]
    useEffect(() => {
        if (!productsLoaded) {
            dispatch(fetchProductsAsync());
        }
    }, [productsLoaded, dispatch])

    if (status.includes('pending')) {
        return <LoadingComponent message='Loading products...' />
    }

    return (
        <>
            <ProductList products={products} />
        </>
    )
}