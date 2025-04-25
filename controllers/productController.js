const { product, brandcategory, category, subcategory, brand,  } = require("../models")
const fs = require('fs');
const path = require('path');

exports.findAllProducts = async(req, res) =>{
    try{
        const products = await product.findAll({
            include: [
              {
                model: brandcategory,
                as: 'brandcategory',
                include: [
                  {
                    model: brand,
                    as: 'brand',
                    attributes: ['brand_id', 'brand_name']
                  },
                  {
                    model: category,
                    as: 'category',
                    attributes: ['product_category_id', 'category_name']
                  },
                  {
                    model: subcategory,
                    as: 'subcategory',
                    attributes: ['sub_category_id', 'sub_category_name']
                  }
                ]
              }
            ],
            order:[
                ['product_id', 'ASC']
            ]
          });
          
            const data = products.map(p=>({
                product_product_id: p.product_id,
                product_part_number: p.part_number,
                product_price: p.price,
                product_image: p.image,
                product_quantity: p.quantity,
                product_short_description: p.short_description,
                product_status: p.status,
                product_condition: p.condition,
                product_sub_condition: p.sub_condition,
                product_long_description: p.long_description,
                category_product_category_id: p.brandcategory.category.product_category_id,
                category_category_name: p.brandcategory.category.category_name,
                brand_brand_id: p.brandcategory.brand.brand_id,
                brand_brand_name: p.brandcategory.brand.brand_name,
                }));
                res.json(data);

    }catch(err){
        res.status(404).json({error: err.message})
    }

}
// exports.findAllProducts = async (req, res) => {
//   try {
//     // Parse pagination parameters from query string
//     const page = parseInt(req.query.page) || 1; // default to page 1
//     const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
//     const offset = (page - 1) * limit;

//     const { count, rows: products } = await product.findAndCountAll({
//       include: [
//         {
//           model: brandcategory,
//           as: 'brandcategory',
//           include: [
//             {
//               model: brand,
//               as: 'brand',
//               attributes: ['brand_id', 'brand_name']
//             },
//             {
//               model: category,
//               as: 'category',
//               attributes: ['product_category_id', 'category_name']
//             },
//             {
//               model: subcategory,
//               as: 'subcategory',
//               attributes: ['sub_category_id', 'sub_category_name']
//             }
//           ]
//         }
//       ],
//       order: [['product_id', 'ASC']],
//       limit,
//       offset
//     });

//     const data = products.map(p => ({
//       product_product_id: p.product_id,
//       product_part_number: p.part_number,
//       product_price: p.price,
//       product_image: p.image,
//       product_quantity: p.quantity,
//       product_short_description: p.short_description,
//       product_status: p.status,
//       product_condition: p.condition,
//       product_sub_condition: p.sub_condition,
//       product_long_description: p.long_description,
//       category_product_category_id: p.brandcategory.category.product_category_id,
//       category_category_name: p.brandcategory.category.category_name,
//       brand_brand_id: p.brandcategory.brand.brand_id,
//       brand_brand_name: p.brandcategory.brand.brand_name,
//     }));

//     res.json({
//       totalItems: count,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//       products: data
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.uploadProduct = async (req, res) => {
  try {
    const image = req.file;
    const {
      brand_name,
      category_name,
      sub_category_name,
      price,
      quantity,
      short_description,
      status,
      part_number,
      condition,
      sub_condition,
      long_description
    } = req.body;

    if (!image) return res.status(400).json({ success: false, message: 'Image is required' });

    const imageUrl = `https://cdn.niftyorbit.com/${image.originalname}`;

    // Find Brand
    const brands = await brand.findOne({ where: { brand_name } });
    if (!brands) return res.status(404).json({ success: false, message: `Brand '${brand_name}' not found.` });

    // Find Category
    const categorys = await category.findOne({ where: { category_name } });
    if (!categorys) return res.status(404).json({ success: false, message: `Category '${category_name}' not found.` });

    // Find SubCategory
    const subCategory = await subcategory.findOne({ where: { sub_category_name } });
    if (!subCategory) return res.status(404).json({ success: false, message: `Subcategory '${sub_category_name}' not found.` });

    // Find BrandCategory relation
    const brandCategory = await brandcategory.findOne({
      where: {
        brand_id: brands.brand_id,
        category_id: categorys.product_category_id,
        sub_category_id: subCategory.sub_category_id
      }
    });

    if (!brandCategory) {
      return res.status(404).json({
        success: false,
        message: `No brand-category-subcategory relation found for ${brand_name} -> ${category_name} -> ${sub_category_name}.`
      });
    }
    console.log(brandCategory.id);

    // Create Product
    const newProduct = await product.create({
      image: imageUrl,
      price,
      quantity,
      short_description,
      status,
      part_number,
      condition,
      sub_condition,
      long_description,
      brandcategoryId: brandCategory.id
    });
console.log(newProduct.id)
    res.status(201).json({ success: true, message: 'Product added successfully!', product: newProduct });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await product.findByPk(id);

    if (!products) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (products.image) {
      const imagePath = path.join('/root/projects/images', path.basename(products.image));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err.message);
        }
      });
    }

    await products.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateDto = req.body;
  const image = req.file;

  try {
    const products = await product.findByPk(id);
    if (!products) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete old image if exists
    if (image) {
      if (products.image) {
        const oldImagePath = path.join('/root/projects/images', path.basename(products.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update image URL
      updateDto.image = `https://cdn.niftyorbit.com/${image.filename}`;
    }

    // Update product fields
    await products.update(updateDto);

    res.json({ message: 'Product updated successfully', products });
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

