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
        where: { id: brandId },
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            include: [
              {
                model: category,
                as: 'category',
                where: categoryId ? { id: categoryId } : undefined,
                required: !!categoryId,
              },
              {
                model: subcategory,
                as: 'subcategory',
                where: subcategoryId ? { id: subcategoryId } : undefined,
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
          brand_id: b.id,
          brand_name: b.name,
        };
  
        // If only brandId → return brand with all products (across all brandcategory entries)
        if (!categoryId && !subcategoryId) {
          const allProducts = b.brandcategory.flatMap((bc) => bc.product || []);
          brandObj.products = allProducts.map((p) => ({
            product_id: p.id,
            part_number: p.partnumber,
          }));
          return brandObj;
        }
  
        // If brandId + categoryId (and optionally subcategoryId)
        brandObj.categories = b.brandcategory.map((bc) => {
          const categoryInfo = {
            category_id: bc.category?.id,
            category_name: bc.category?.name,
          };
  
          if (subcategoryId) {
            categoryInfo.subcategories = [
              {
                sub_category_id: bc.subcategory?.id,
                sub_category_name: bc.subcategory?.name,
                products: (bc.product || []).map((p) => ({
                  product_id: p.id,
                  part_number: p.partnumber,
                })),
              },
            ];
          } else {
            categoryInfo.products = (bc.product || []).map((p) => ({
              product_id: p.id,
              part_number: p.partnumber,
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
        attributes: ['id', 'name'],
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            attributes: ['id'],
            include: [
              {
                model: category,
                as: 'category',
                attributes: ['id', 'name'],
              },
              {
                model: subcategory,
                as: 'subcategory',
                attributes: ['id', 'name'],
              },
              {
                model: product,
                as: 'product',
                attributes: ['id', 'partnumber'],
              },
            ],
          },
        ],
        order: [
          ['id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: category, as: 'category' }, 'id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: subcategory, as: 'subcategory' }, 'id', 'ASC'],
          [{ model: brandcategory, as: 'brandcategory' }, { model: product, as: 'product' }, 'id', 'ASC'],
        ],
      });
  
      if (!data.length) {
        return res.status(404).json({ error: 'No brands found.' });
      }
  
      // ✅ Transform to nested structure
      const result = data.map((b) => {
        const brandObj = {
          brand_id: b.id,
          brand_name: b.name,
          categories: [],
        };
  
        const categoryMap = new Map();
  
        b.brandcategory.forEach((bc) => {
          const cat = bc.category;
          const sub = bc.subcategory;
          const prodList = bc.product || [];
  
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.id, {
              category_id: cat.id,
              category_name: cat.name,
              subcategories: [],
            });
          }
  
          const categoryEntry = categoryMap.get(cat.id);
  
          let subcategoryEntry = categoryEntry.subcategories.find(s => s.subcategory_id === sub.id);
          if (!subcategoryEntry) {
            subcategoryEntry = {
              subcategory_id: sub.id,
              subcategory_name: sub.name,
              products: [],
            };
            categoryEntry.subcategories.push(subcategoryEntry);
          }
  
          prodList.forEach((p) => {
            if (!subcategoryEntry.products.find(pr => pr.product_id === p.id)) {
              subcategoryEntry.products.push({
                product_id: p.id,
                product_name: p.partnumber,
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
          name: {
            [Op.iLike]: `%${categoryName}%`,
          },
        },
        attributes: ['id'],
      });
  
      const categoryIds = matchingCategories.map((cat) => cat.id);
  
      if (!categoryIds.length) {
        return res.status(404).json({ error: 'No matching categories found.' });
      }
  
      // STEP 2: Fetch brands with brandcategories matching those category IDs
      const brands = await brand.findAll({
        attributes: ['id', 'name'],
        include: [
          {
            model: brandcategory,
            as: 'brandcategory',
            attributes: ['id'],
            where: {
              categoryId: {
                [Op.in]: categoryIds,
              },
            },
            include: [
              {
                model: category,
                as: 'category',
                attributes: ['id', 'name'],
              },
              {
                model: subcategory,
                as: 'subcategory',
                attributes: ['id', 'name'],
                required: false,
              },
              {
                model: product,
                as: 'product',
                attributes: [
                  'id',
                  'partnumber',
                  'price',
                  'quantity',
                  'shortdescription',
                  'longdescription',
                  'image',
                  'subcondition',
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
          brand_id: b.id,
          brand_name: b.name,
          categories: [],
        };
  
        const categoryMap = new Map();
  
        b.brandcategory.forEach((bc) => {
          const cat = bc.category;
          if (!cat) return;
  
          const sub = bc.subcategory;
          const prodList = bc.product || [];
  
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.id, {
              category_id: cat.id,
              category_name: cat.name,
              subcategories: [],
            });
          }
  
          const categoryEntry = categoryMap.get(cat.id);
  
          if (sub) {
            let subcategoryEntry = categoryEntry.subcategories.find(
              (s) => s.subcategory_id === sub.id
            );
  
            if (!subcategoryEntry) {
              subcategoryEntry = {
                subcategory_id: sub.id,
                subcategory_name: sub.name,
                products: [],
              };
              categoryEntry.subcategories.push(subcategoryEntry);
            }
  
            prodList.forEach((p) => {
              subcategoryEntry.products.push({
                product_id: p.id,
                product_name: p.partnumber,
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
        b.id,
        b.name,
        JSON_AGG(DISTINCT c.name) AS categories
      FROM
        brands b
      LEFT JOIN brandcategories bc ON bc."brandId" = b.id
      LEFT JOIN categories c ON bc."categoryId" = c.id
      LEFT JOIN subcategories s ON bc."subcategoryId" = s.id
      GROUP BY b.id, b.name
      ORDER BY b.id ASC
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




  