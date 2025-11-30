export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoURL?: string;
    phone?: string;
    role?: 'USER' | 'SELLER' | 'ADMIN';
    favorites?: string[];
    createdAt?: any; // Firestore Timestamp
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: string; // Stored as string in some places, float in others. Let's standardize or handle both. Based on create-listing, it's string input but maybe number in DB.
    unit: string;
    stock?: number;
    images: string[];
    image?: string; // Main image
    categoryId?: string; // For relational DB
    category: string; // For Firestore simple structure
    mainCategory?: string;
    subCategory?: string;
    type?: string;
    breed?: string;
    sellerId?: string;
    seller: Partial<User>;
    location: string;
    locationAddress?: string;
    locationCoords?: {
        latitude: number;
        longitude: number;
    };
    isActive: boolean;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any;

    // Category specific fields
    gender?: string;
    age?: string;
    weight?: string;
    organicCertified?: boolean;
    harvestDate?: string;
    storageCondition?: string;
    bulkAvailable?: boolean;
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    slug?: string;
    parentId?: string;
    subCategories?: Category[];
}
