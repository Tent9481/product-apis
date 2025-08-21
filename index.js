const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Utility function to check if an item is valid
function isValidItem(item) {
    // Check that all required fields exist and are not malformed (simple example)
    const requiredFields = [
        'id', 'name', 'brand', 'category', 'description', 'price', 'currency',
        'processor', 'memory', 'release_date', 'average_rating', 'rating_count'
    ];

    // Check fields exist
    for (const field of requiredFields) {
        if (!(field in item)) {
            return false;
        }
    }

   
    return true;
}

app.get('/step1', async (req, res) => {
    try {
        const response = await axios.get('http://interview.surya-digital.in/get-electronics');
        const data = response.data;

        if (!Array.isArray(data)) {
            return res.status(500).json({ error: 'Unexpected API response format' });
        }

        // Filter out malformed/error items
        const filteredData = data.filter(isValidItem);

        // Map to the required structure with exact casing
        const formattedData = filteredData.map(item => ({
            product_id: item.id ?? null,
            product_name: item.name ?? null,
            brand_name: item.brand ?? null,
            category_name: item.category ?? null,
            description_text: item.description ?? null,
            price: item.price ?? null,
            currency: item.currency ?? null,
            processor: item.processor ?? null,
            memory: item.memory ?? null,
            release_date: item.release_date ?? null,
            average_rating: item.average_rating ?? null,
            rating_count: item.rating_count ?? null
        }));

        res.json(formattedData);

    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from external API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
