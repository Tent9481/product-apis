import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "electronics_db"
});

app.get('/step6', async (req, res) => {
  let { page_size, page_number, brands, release_date_start, release_date_end } = req.query;

  // Validate mandatory params
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  if (isNaN(page_size) || page_size <= 0 || isNaN(page_number) || page_number <= 0) {
    return res.status(400).json({ error: "Both page_size and page_number must be positive integers" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT p.id as product_id, p.name as product_name, 
             p.category_name, p.description, p.price, p.currency,
             p.processor, p.memory, p.release_date, 
             p.average_rating, p.rating_count,
             b.name as brand_name, b.year_founded,
             b.street, b.city, b.state, b.postal_code, b.country
      FROM products p
      JOIN brands b ON p.brand_id = b.id
    `);

    let results = rows.map(r => {
      const companyAge = new Date().getFullYear() - r.year_founded;
      const address = `${r.street}, ${r.city}, ${r.state}, ${r.postal_code}, ${r.country}`;
      return {
        product_id: r.product_id,
        product_name: r.product_name,
        brand: {
          name: r.brand_name,
          year_founded: r.year_founded,
          company_age: companyAge,
          address: address
        },
        category_name: r.category_name,
        description_text: r.description,
        price: r.price,
        currency: r.currency,
        processor: r.processor,
        memory: r.memory,
        release_date: r.release_date,
        average_rating: r.average_rating,
        rating_count: r.rating_count
      };
    });

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
    console.error("DB Error:", error);
    return res.status(500).json({ error: "Database query failed" });
  }
});
