const mongoose = require("mongoose")

const mongooseSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    content:{
        type:String,
        required:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chats"
    },
    role:{
        type:String,
        enum:["user","model"],
        default:"user"
    }
},{
    timestamps:true
})

const messageModel = mongoose.model("messages",mongooseSchema)

module.exports = messageModel