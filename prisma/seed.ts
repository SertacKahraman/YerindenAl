import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Örnek kullanıcı oluştur
    const hashedPassword = await bcrypt.hash('123456', 10);
    const seller = await prisma.user.create({
        data: {
            name: 'Ahmet Çiftçi',
            email: 'ahmet@example.com',
            phone: '5551234567',
            password: hashedPassword,
            role: 'SELLER',
        },
    });

    // Ana kategoriler
    const dairyCategory = await prisma.category.create({
        data: {
            name: 'Süt Ürünleri',
            slug: 'sut-urunleri',
            description: 'Taze süt ve süt ürünleri',
            image: 'https://example.com/dairy.jpg',
        },
    });

    const eggsCategory = await prisma.category.create({
        data: {
            name: 'Yumurta',
            slug: 'yumurta',
            description: 'Taze yumurta çeşitleri',
            image: 'https://example.com/eggs.jpg',
        },
    });

    const honeyCategory = await prisma.category.create({
        data: {
            name: 'Bal ve Arı Ürünleri',
            slug: 'bal-ve-ari-urunleri',
            description: 'Doğal bal ve arı ürünleri',
            image: 'https://example.com/honey.jpg',
        },
    });

    // Alt kategoriler
    const milkCategory = await prisma.category.create({
        data: {
            name: 'Süt',
            slug: 'sut',
            description: 'Taze süt çeşitleri',
            image: 'https://example.com/milk.jpg',
            parentId: dairyCategory.id,
        },
    });

    const cheeseCategory = await prisma.category.create({
        data: {
            name: 'Peynir',
            slug: 'peynir',
            description: 'Taze peynir çeşitleri',
            image: 'https://example.com/cheese.jpg',
            parentId: dairyCategory.id,
        },
    });

    // Örnek ürünler
    await prisma.product.create({
        data: {
            title: 'Taze Köy Sütü',
            slug: 'taze-koy-sutu',
            description: 'Günlük taze köy sütü, doğal ve katkısız',
            price: 25.00,
            unit: 'litre',
            stock: 100,
            images: ['https://example.com/milk1.jpg', 'https://example.com/milk2.jpg'],
            categoryId: milkCategory.id,
            sellerId: seller.id,
            location: 'İstanbul',
        },
    });

    await prisma.product.create({
        data: {
            title: 'Organik Yumurta',
            slug: 'organik-yumurta',
            description: 'Serbest gezen tavuk yumurtası',
            price: 45.00,
            unit: 'adet',
            stock: 50,
            images: ['https://example.com/egg1.jpg', 'https://example.com/egg2.jpg'],
            categoryId: eggsCategory.id,
            sellerId: seller.id,
            location: 'Ankara',
        },
    });

    await prisma.product.create({
        data: {
            title: 'Çiçek Balı',
            slug: 'cicek-bali',
            description: 'Doğal çiçek balı',
            price: 150.00,
            unit: 'kg',
            stock: 30,
            images: ['https://example.com/honey1.jpg', 'https://example.com/honey2.jpg'],
            categoryId: honeyCategory.id,
            sellerId: seller.id,
            location: 'İzmir',
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 