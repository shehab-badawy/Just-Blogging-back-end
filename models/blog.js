const mongoose = require('mongoose')

const {Schema, model} = mongoose

const blog_schema = new Schema(
{
    title: String,
    summary: String,
    content: String,
    cover: String,
    author_id: {type: Schema.Types.ObjectId, ref:'User'},

}, {timestamps: true}
)

const blog_model = model('Blog', blog_schema)

module.exports = blog_model