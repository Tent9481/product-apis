const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Utility function to check if an item is valid
function isValidItem(item) {
    const requiredFields = [
        'id', 'name', 'brand', 'category', 'description', 'price', 'currency',
        'processor', 'memory', 'release_date', 'average_rating', 'rating_count'
    ];
    for (const field of requiredFields) {
        if (!(field in item)) {
            return false;
        }
    }
    return true;
}

// Helper to validate date strings in YYYY-MM-DD format
function isValidDateString(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

app.get('/step2', async (req, res) => {
    try {
        const { release_date_start, release_date_end } = req.query;

        // Validate date params if present
        if (release_date_start && !isValidDateString(release_date_start)) {
            return res.status(400).json({ error: 'Invalid release_date_start format. Expected YYYY-MM-DD.' });
        }
        if (release_date_end && !isValidDateString(release_date_end)) {
            return res.status(400).json({ error: 'Invalid release_date_end format. Expected YYYY-MM-DD.' });
        }

        const response = await axios.get('http://interview.surya-digital.in/get-electronics');
        const data = response.data;

        if (!Array.isArray(data)) {
            return res.status(500).json({ error: 'Unexpected API response format' });
        }

        const filteredData = data.filter(isValidItem).filter(item => {
            const itemDate = new Date(item.release_date);
            if (release_date_start && itemDate < new Date(release_date_start)) {
                return false;
            }
            if (release_date_end && itemDate > new Date(release_date_end)) {
                return false;
            }
            return true;
        });

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
