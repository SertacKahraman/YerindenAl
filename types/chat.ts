export interface Chat {
    id: string;
    users: string[]; // Sohbete dahil kullanıcı id'leri
    lastMessage: string;
    lastMessageAt: Date;
    productId?: string; // Ürün üzerinden başlatıldıysa
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: Date;
} 