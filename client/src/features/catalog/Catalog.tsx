import { Product } from "../../app/models/product"
import ProductList from "./ProductList";
import { useState, useEffect } from "react";


export default function Catalog() {

    const [products, setProducts] = useState<Product[]>([]);

    // This [useEffect] will be called (Once) when the [Component] first [Mounts]
    useEffect(() => {
        //The [fetch] [return] a [Promise] which is [Baiscally] the [response]. Continue to [then]
        fetch('http://localhost:5185/api/products')
            // After the [fetch] we [convert] the [response] to a [Json] format so we could read it.
            .then(response => response.json())
            // And then we [take] the [data] that we got from the [response] after we [converted] it[Json] format. Continue DownVV
            // And [Pass] it into are [setProducts] [state].
            .then(data => setProducts(data))

    }, [])


    return (
        <>
            <ProductList products={products} />
        </>
    )
}