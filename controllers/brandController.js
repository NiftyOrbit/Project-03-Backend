// controller.js
const { brand, category, subcategory, brandcategory, product } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models'); // your Sequelize instance



exports.getAllProductWithBrandAndCategory = async (req, res) => {
    const { brandId, categoryId, subcategoryId } = req.query;
  
    try {
      if (!brandId) {
        return res.status(400).json({ error: 'brandId is required' });
      }
  
      const brands = await brand.findAll({
        where: { brand_id: brandId },
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            include: [
              {
                model: category,
                as: 'category',
                where: categoryId ? { product_category_id: categoryId } : undefined,
                required: !!categoryId,
              },
              {
                model: subcategory,
                as: 'subcategory',
                where: subcategoryId ? { sub_category_id: subcategoryId } : undefined,
                required: !!subcategoryId,
              },
              {
                model: product,
                as: 'product',
                required: false,
              },
            ],
          },
        ],
      });
  
      if (!brands.length) {
        return res.status(404).json({ error: 'No matching data found' });
      }
  
      const response = brands.map((b) => {
        const brandObj = {
          brand_id: b.brand_id,
          brand_name: b.brand_name,
        };
  
        // If only brandId → return brand with all products (across all brandcategory entries)
        if (!categoryId && !subcategoryId) {
          const allProducts = b.brandcategory.flatMap((bc) => bc.product || []);
          brandObj.products = allProducts.map((p) => ({
            product_id: p.product_id,
            part_number: p.part_number,
          }));
          return brandObj;
        }
  
        // If brandId + categoryId (and optionally subcategoryId)
        brandObj.categories = b.brandcategory.map((bc) => {
          const categoryInfo = {
            category_id: bc.category?.product_category_id,
            category_name: bc.category?.category_name,
          };
  
          if (subcategoryId) {
            categoryInfo.subcategories = [
              {
                sub_category_id: bc.subcategory?.sub_category_id,
                sub_category_name: bc.subcategory?.sub_category_name,
                products: (bc.product || []).map((p) => ({
                  product_id: p.product_id,
                  part_number: p.part_number,
                })),
              },
            ];
          } else {
            categoryInfo.products = (bc.product || []).map((p) => ({
              product_id: p.product_id,
              part_number: p.part_number,
            }));
          }
  
          return categoryInfo;
        });
  
        return brandObj;
      });
  
      res.json(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: error.message });
    }
};

exports.getPartName = async (req, res) => {
    try {
      // Fetch flat joined data using Sequelize
      const data = await brand.findAll({
        attributes: ['brand_id', 'brand_name'],
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            attributes: ['id'],
            include: [
              {
                model: category,
                as: 'category',
                attributes: ['product_category_id', 'category_name'],
              },
              {
                model: subcategory,
                as: 'subcategory',
                attributes: ['sub_category_id', 'sub_category_name'],
              },
              {
                model: product,
                as: 'product',
                attributes: ['product_id', 'part_number'],
              },
            ],
          },
        ],
        order: [
          ['brand_id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: category, as: 'category' }, 'product_category_id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: subcategory, as: 'subcategory' }, 'sub_category_id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: product, as: 'product' }, 'product_id', 'ASC'],
        ],
      });
  
      if (!data.length) {
        return res.status(404).json({ error: 'No brands found.' });
      }
  
      // ✅ Transform to nested structure
      const result = data.map((b) => {
        const brandObj = {
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          categories: [],
        };
  
        const categoryMap = new Map();
  
        b.brandcategory.forEach((bc) => {
          const cat = bc.category;
          const sub = bc.subcategory;
          const prodList = bc.product || [];
  
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.produtc_category_id, {
              category_id: cat.product_category_id,
              category_name: cat.category_name,
              subcategories: [],
            });
          }
  
          const categoryEntry = categoryMap.get(cat.id);
  
          let subcategoryEntry = categoryEntry.subcategories.find(s => s.subcategory_id === sub.id);
          if (!subcategoryEntry) {
            subcategoryEntry = {
              subcategory_id: sub.sub_category_id,
              subcategory_name: sub.sub_category_name,
              products: [],
            };
            categoryEntry.subcategories.push(subcategoryEntry);
          }
  
          prodList.forEach((p) => {
            if (!subcategoryEntry.products.find(pr => pr.product_id === p.id)) {
              subcategoryEntry.products.push({
                product_id: p.product_id,
                product_name: p.part_number,
              });
            }
          });
        });
  
        brandObj.categories = Array.from(categoryMap.values());
        return brandObj;
      });
  
      res.json(result);
    } catch (err) {
      console.error('Error fetching part names:', err);
      res.status(500).json({ error: err.message });
    }
};
exports.getBrandsByCategory = async (req, res) => {
    try {
      const { categoryName } = req.query;
  
      if (!category) {
        return res.status(400).json({ error: 'category is required.' });
      }
  
      // STEP 1: Get category IDs matching 'router' (case-insensitive)
      const matchingCategories = await category.findAll({
        where: {
           // name: categoryName
          category_name: {
            [Op.iLike]: `%${categoryName}%`,
          },
        },
        attributes: ['product_category_id'],
      });
  
      const categoryIds = matchingCategories.map((cat) => cat.product_category_id);
  
      if (!categoryIds.length) {
        return res.status(404).json({ error: 'No matching categories found.' });
      }
  
      // STEP 2: Fetch brands with brandcategories matching those category IDs
      const brands = await brand.findAll({
        attributes: ['brand_id', 'brand_name'],
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            attributes: ['id'],
            where: {
              category_id: {
                [Op.in]: categoryIds,
              },
            },
            include: [
              {
                model: category,
                as: 'category',
                attributes: ['product_category_id', 'category_name'],
              },
              {
                model: subcategory,
                as: 'subcategory',
                attributes: ['sub_category_id', 'sub_category_name'],
                required: false,
              },
              {
                model: product,
                as: 'product',
                attributes: [
                  'product_id',
                  'part_number',
                  'price',
                  'quantity',
                  'short_description',
                  'long_description',
                  'image',
                  'sub_condition',
                  'condition',
                ],
                required: false,
              },
            ],
          },
        ],
      });
  
      // STEP 3: Transform the response
      const result = brands.map((b) => {
        const brandObj = {
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          categories: [],
        };
  
        const categoryMap = new Map();
  
        b.brandcategory.forEach((bc) => {
          const cat = bc.category;
          if (!cat) return;
  
          const sub = bc.subcategory;
          const prodList = bc.product || [];
  
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.product_category_id, {
              category_id: cat.product_category_id,
              category_name: cat.category_name,
              subcategories: [],
            });
          }
  
          const categoryEntry = categoryMap.get(cat.product_category_id);
  
          if (sub) {
            let subcategoryEntry = categoryEntry.subcategories.find(
              (s) => s.subcategory_id === sub.sub_category_id
            );
  
            if (!subcategoryEntry) {
              subcategoryEntry = {
                subcategory_id: sub.sub_category_id,
                subcategory_name: sub.sub_category_name,
                products: [],
              };
              categoryEntry.subcategories.push(subcategoryEntry);
            }
  
            prodList.forEach((p) => {
              subcategoryEntry.products.push({
                product_id: p.product_id,
                product_name: p.part_number,
                price: p.price,
                quantity: p.quantity,
                short_des: p.short_description,
                long_description: p.long_description,
                product_image: p.image,
                SubCondition: p.sub_condition,
                condition: p.condition,
              });
            });
          }
        });
  
        brandObj.categories = Array.from(categoryMap.values());
        return brandObj;
      });
  
      res.json(result);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllCategoriesOfAllBrand = async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT
        b.brand_id,
        b.brand_name,
        JSON_AGG(DISTINCT c.category_name) AS categories
      FROM
        brands b
      LEFT JOIN brandcategory bc ON bc."brand_id" = b.brand_id
      LEFT JOIN categories c ON bc."category_id" = c.product_category_id
      LEFT JOIN subcategories s ON bc."sub_category_id" = s.sub_category_id
      GROUP BY b.brand_id, b.brand_name
      ORDER BY b.brand_id ASC
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching brand categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




  