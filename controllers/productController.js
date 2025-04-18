const { product, brandcategory, brand, category, subcategory } = require("../models")

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
                    attributes: ['id', 'name']
                  },
                  {
                    model: category,
                    as: 'category',
                    attributes: ['id', 'name']
                  },
                  {
                    model: subcategory,
                    as: 'subcategory',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ],
            order:[
                ['id', 'ASC']
            ]
          });
          
            const data = products.map(p=>({
                id: p.id,
                name: p.partnumber,
                price: p.price,
                description: p.description,
                image: p.image,
                quantity: p.quantity,
                short_description: p.shortdescription,
                status: p.status,
                condition: p.condition,
                sub_condition: p.sub_condition,
                long_description: p.longdescription,
                category_id: p.brandcategory.category.id,
                category_name: p.brandcategory.category.name,
                brand_id: p.brandcategory.brand.id,
                brand_name: p.brandcategory.brand.name,
                }));
                res.json(data);

    }catch(err){
        res.status(404).json({error: err.message})
    }

}