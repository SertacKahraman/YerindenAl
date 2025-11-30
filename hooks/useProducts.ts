import { collection, DocumentData, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { Product } from '../types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Basic query to get all products
            // In a real app, you might want pagination or specific filtering here
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const items: Product[] = [];
            querySnapshot.forEach((doc: DocumentData) => {
                items.push({ id: doc.id, ...doc.data() } as Product);
            });

            setProducts(items);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Ürünler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const refreshProducts = () => {
        fetchProducts();
    };

    return { products, loading, error, refreshProducts };
}
