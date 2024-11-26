const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const User = require("./models/user")
const jwt = require('jsonwebtoken')
const multer = require('multer')
const fs = require('fs')
const uploadMiddleWare = multer ({dest: 'uploads/'})
const Blog = require('./models/blog');
const blog_model = require('./models/blog');
const app = express();

app.use(cors({credentials: true, origin:'http://localhost:3000'}))
app.use(bodyParser.json());
private_key = "3jm(rrSeX+0rQ0*"
app.use(cookieParser(private_key))
app.use('/uploads',express.static(__dirname + '/uploads'))

mongoose.connect("this is private")

// Parse incoming request bodies in URL-encoded format
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/signup", async (req, res) => 
{
    const {email, username, password} = req.body

    try
    {
        const UserDoc = await User.create(
            {
                 email, username, password: bcrypt.hashSync(password)
            }
        );
        res.json(UserDoc)
    }
    catch(e)
    {
        console.log(e);
        res.status(400).json(e)
    }
})

app.post("/signin", async (req, res) => 
{
    const {username, password} = req.body
    const UserDoc = await User.findOne({username})
    if(UserDoc == null)
    {
        res.status(400).json("wrong info")
        return
    }
    const pass_validation = bcrypt.compareSync(password, UserDoc.password)
    if(pass_validation === true)
    {
        jwt.sign({username, id:UserDoc._id}, private_key, {},(error,token) =>
        {
            if(error)
            res.status(400).json("wrong info");
            console.log(token)
            res.cookie('token', token).json(
                {
                    id: UserDoc._id,
                    username,
                })
        })
    }
    else
    {
        res.status(400).json("wrong info")
    }
})

app.get('/profile', (req, res) => 
{
    const token = req.cookies.token
    console.log(token);
    jwt.verify(token, private_key, {}, (error, info)=>
    {
        if(error)
            throw error
        res.json(info)
    })
})

app.post('/signout', (req,res)=>
    {
        res.cookie('token', '').json('OK');  
    })

app.post("/create", uploadMiddleWare.single('file'), async (req, res)=>
    {
        const file_name = req.file.originalname
        const img_path = 'uploads\\'+file_name
        fs.renameSync(req.file.path,  img_path)
        const token = req.cookies.token
        jwt.verify(token, private_key, {}, async (error, info)=>
            {
                if(error) throw error
                const {title, summary, content} = req.body
                const blog_doc = await Blog.create(
                    {
                        title,
                        summary,
                        content,
                        cover: img_path,
                        author_id: info.id,
                    })
                    console.log(info.id)
                    res.json(blog_doc)
            })

    })

    app.get("/blog", async (req, res) => 
        {
            res.json(
                await blog_model.find().populate('author_id', ['username']).sort({createdAt: -1}).limit(10)
        )
        })


    app.get('/blog/:id', async (req, res) => 
        {
            const {id} = req.params
            const blog_doc = await blog_model.findById(id).populate('author_id', ['username'])
            res.json(blog_doc)
        })



    app.put('/blog', uploadMiddleWare.single('file') ,async (req, res)=>
        {
            let img_path = null
            if(req.file)
            {
                const file_name = req.file.originalname
                img_path = 'uploads\\'+file_name
                fs.renameSync(req.file.path,  img_path)
            }
            const token = req.cookies.token
            jwt.verify(token, private_key, {}, async (error, info)=>
                {
                    const {id, title, summary, content} = req.body
                    if(error) throw error
                    const blog_doc = await blog_model.findById(id)
                    const isOwner = JSON.stringify(blog_doc.author_id) === JSON.stringify(info.id)
                    if(!isOwner)
                    {
                        return res.status(400).json("Not permited")
                    }
                    await blog_doc.updateOne({title, summary, content, cover: img_path ? img_path: blog_doc.cover})

                    res.json(blog_doc)
                })
            
        })
app.listen(4000)