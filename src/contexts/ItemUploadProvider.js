import React, { createContext, useState } from 'react';

export const ItemUploadContext = createContext();

export const ItemUploadProvider = ({ children }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [mainCategoryId, setMainCategoryId] = useState(null);
    const [subCategoryId, setSubCategoryId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [images, setImages] = useState([]);
    const [auctionOption, setAuctionOption] = useState(null);

    return (
        <ItemUploadContext.Provider
            value={{
                title, setTitle,
                description, setDescription,
                startPrice, setStartPrice,
                mainCategoryId, setMainCategoryId,
                subCategoryId, setSubCategoryId,
                selectedCategory, setSelectedCategory,
                images, setImages,
                auctionOption, setAuctionOption,
            }}
        >
            {children}
        </ItemUploadContext.Provider>
    );
};
