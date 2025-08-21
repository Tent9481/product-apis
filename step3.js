app.get('/step3', (req, res) => {
  let { brands, release_date_start, release_date_end } = req.query;

  // Clone data from step1 response
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

  res.json(results);
});
