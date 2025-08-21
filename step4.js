app.get('/step4', (req, res) => {
  let { page_size, page_number, brands, release_date_start, release_date_end } = req.query;

  // Validate mandatory params
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);

  if (isNaN(page_size) || page_size <= 0 || isNaN(page_number) || page_number <= 0) {
    return res.status(400).json({ error: "Both page_size and page_number must be positive integers" });
  }

  // Start with full dataset
  let results = [...products]; 

  // Brand filter
  if (brands) {
    const brandList = brands.split(',').map(b => b.trim());
    results = results.filter(p => brandList.includes(p.brand));
  }

  // Release date filters
  if (release_date_start) {
    results = results.filter(p => new Date(p.release_date) >= new Date(release_date_start));
  }

  if (release_date_end) {
    results = results.filter(p => new Date(p.release_date) <= new Date(release_date_end));
  }

  // Pagination logic
  const startIndex = (page_number - 1) * page_size;
  const endIndex = startIndex + page_size;

  if (startIndex >= results.length) {
    return res.json([]); // no data for this page
  }

  const paginatedResults = results.slice(startIndex, endIndex);

  res.json(paginatedResults);
});
