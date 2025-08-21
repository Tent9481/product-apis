import axios from "axios";

app.get('/step5', async (req, res) => {
  let { page_size, page_number, brands, release_date_start, release_date_end } = req.query;

  // Validate pagination params
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  if (isNaN(page_size) || page_size <= 0 || isNaN(page_number) || page_number <= 0) {
    return res.status(400).json({ error: "Both page_size and page_number must be positive integers" });
  }

  try {
    // Fetch both APIs
    const [electronicsRes, brandsRes] = await Promise.all([
      axios.get("https://api.example.com/get-electronics"),
      axios.get("https://api.example.com/get-electronics-brands")
    ]);

    const products = electronicsRes.data;
    const brandsData = brandsRes.data;

    // Merge products with brand details
    let results = products.map(p => {
      const brandInfo = brandsData.find(b => b.name === p.brand);

      if (!brandInfo) return null; // skip if no matching brand

      // Format address
      const address = `${brandInfo.address.street}, ${brandInfo.address.city}, ${brandInfo.address.state}, ${brandInfo.address.postal_code}, ${brandInfo.address.country}`;

      // Calculate company age
      const currentYear = new Date().getFullYear();
      const companyAge = currentYear - brandInfo.year_founded;

      return {
        product_id: p.id,
        product_name: p.name,
        brand: {
          name: brandInfo.name,
          year_founded: brandInfo.year_founded,
          company_age: companyAge,
          address: address
        },
        category_name: p.category,
        description_text: p.description,
        price: p.price,
        currency: p.currency,
        processor: p.processor,
        memory: p.memory,
        release_date: p.release_date,
        average_rating: p.average_rating,
        rating_count: p.rating_count
      };
    }).filter(Boolean);

    // Apply brand filter
    if (brands) {
      const brandList = brands.split(',').map(b => b.trim());
      results = results.filter(p => brandList.includes(p.brand.name));
    }

    // Apply release date filters
    if (release_date_start) {
      results = results.filter(p => new Date(p.release_date) >= new Date(release_date_start));
    }
    if (release_date_end) {
      results = results.filter(p => new Date(p.release_date) <= new Date(release_date_end));
    }

    // Pagination
    const startIndex = (page_number - 1) * page_size;
    const endIndex = startIndex + page_size;
    const paginatedResults = results.slice(startIndex, endIndex);

    return res.json(paginatedResults);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data from APIs" });
  }
});
