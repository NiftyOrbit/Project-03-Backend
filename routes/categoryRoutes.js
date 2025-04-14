var express = require('express');
const Category = require('../models/Category');
const router = express.Router();


router.post('/', async(req, res)=>{
    try{
        const category = await Category.create(req.body);
        res.status(201).json(category);
    }
    catch(err){
        res.status(500).json({message: err.message});}});

router.get('/', async(req, res)=>{
    try{
        const category = await Category.findAll()
        res.status(200).json(category);

    }catch(err){
        res.status(500).json({message: err.message}) }});

module.exports = router;


