const { Workbook } = require("exceljs");
const { product, subcategory, brand, category, brandcategory } = require("../models");
const xlsx = require('xlsx');
const path = require('path');

exports.uploadBulkData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Sample row keys:', Object.keys(data[0]));


    const products = data.map((row, index) => {
        const partnumber = String(row['Part Number'] || row['part_number'] || '').trim();
        const brandCategory = row['brand_category'] || row['Brand Category'] || '';
        const condition = row['Condition'] || row['condition'] || '';
        const subcondition = row['sub_condition'] || row['Sub Condtion'] || '';
        const price = Number(row['Price'] || 0);
        const quantity = Number(row['Quantity'] || 0);
        const shortDesc = row['Short Description'] || '';
        const longDesc = row['Long Description'] || '';
        const status = row['status'] || '';
      
    return {
        partnumber: partnumber,
        brandcategoryId: Number(brandCategory),
        image: `https://cdn.niftyorbit.com/${partnumber}.png`,
        condition: String(condition),
        subcondition: String(subcondition),
        price,
        quantity,
        shortdescription: String(shortDesc),
        longdescription: String(longDesc),
        status: String(status),
      };
  })
      console.log(products);
      const createdProducts = await product.bulkCreate(products);
      res.json({ message: 'Products created successfully', createdProducts });
    }catch(err){
      res.status(404).json({error: err.message});

      }}
exports.uploadBulkDataBrand = async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
          }
      
          const workbook = xlsx.readFile(req.file.path);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = xlsx.utils.sheet_to_json(sheet);
          console.log('Sample row keys:', Object.keys(data[0]));
      
      
          const brands = data.map(async (row, index) => {
            console.log(`Row ${index}:`, row);
             const name = String(row['brand_name'] || row['brand_name'] || '').trim();
  
            const createdBrand = await brand.create({
              name: String(row.brand_name || ''),});
          return {
              name: name
            };
            
        })
            console.log(brands);
            res.json({ message: 'Products created successfully' });
          }catch(err){
            res.status(404).json({error: err.message});
      
      }}
exports.uploadBulkDataCategory = async (req, res) => {
              try {
                if (!req.file) {
                  return res.status(400).json({ error: 'No file uploaded' });
                }
            
                const workbook = xlsx.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);
                console.log('Sample row keys:', Object.keys(data[0]));
            
            
                const brands = data.map((row, index) => {
                    const name = String(row['category_name'] || row['brand_name'] || '').trim();
                    
                  
                return {
                    name: name
                  };
              })
                  console.log(brands);
                  const createdBrand = await category.bulkCreate(brands);
                  res.json({ message: 'Products created successfully', createdBrand });
                }catch(err){
                  res.status(404).json({error: err.message});
            
      }}
exports.uploadBulkDataSubcategory = async (req, res) => {
                    try {
                      if (!req.file) {
                        return res.status(400).json({ error: 'No file uploaded' });
                      }
                  
                      const workbook = xlsx.readFile(req.file.path);
                      const sheetName = workbook.SheetNames[0];
                      const sheet = workbook.Sheets[sheetName];
                      const data = xlsx.utils.sheet_to_json(sheet);
                      console.log('Sample row keys:', Object.keys(data[0]));
                  
                  
                      const brands = data.map((row, index) => {
                          const name = String(row['sub_category_name'] || row['brand'] || '').trim();
                          
                        
                      return {
                          name: name
                        };
                    })
                        console.log(brands);
                        const createdBrand = await subcategory.bulkCreate(brands);
                        res.json({ message: 'Products created successfully', createdBrand });
                      }catch(err){
                        res.status(404).json({error: err.message});
                  
     }}
exports.uploadBulkDataBrandcategory = async (req, res) => {
                          try {
                            if (!req.file) {
                              return res.status(400).json({ error: 'No file uploaded' });
                            }
                        
                            const workbook = xlsx.readFile(req.file.path);
                            const sheetName = workbook.SheetNames[0];
                            const sheet = workbook.Sheets[sheetName];
                            const data = xlsx.utils.sheet_to_json(sheet);
                            console.log('Sample row keys:', Object.keys(data[0]));
                        
                        
                            const brands = data.map((row, index) => {
                                const brandId = String(row['brand_id'] || row['brand'] || '').trim();
                                const categoryId = String(row['category_id'] || row['brand'] || '').trim();
                                const subcategoryId = String(row['sub_category_id'] || row['brand'] || '').trim();

                                
                              
                            return {
                                brandId: brandId,
                                categoryId: categoryId,
                                subcategoryId: subcategoryId
                              };
                          });
                              console.log(brands);
                              const createdBrand = await brandcategory.bulkCreate(brands);
                              res.json({ message: 'Products created successfully', createdBrand });
                            }catch(err){
                              res.status(404).json({error: err.message});
                        
     }}