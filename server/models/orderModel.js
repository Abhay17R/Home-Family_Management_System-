import mongoose from 'mongoose'
import {User} from '../models/userModel.js';

const orderSchema=new mongoose.Schema({
    store:{
        type:String,
        required:[true,'Please enter the store name'],
        trim:true,
    },
    orderId:{
        type:String,
        required:[true,'Please enter the Order ID'],
        unique:true,
    },
    orderDate:{
        type:Date,
        required:[true,'Please enter the order Date'],

    },
    totalAmount:{
        type:Number,
        required:[true,'Please enter the total amount'],

    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Shipped','Delivered','Cancelled'],
        default: 'Pending',
    },
    websiteUrl: {
        type: String,
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    

createdAt: {
        type: Date,
        default: Date.now,
    },
     familyId: {
        type: String,
        required: [true, 'An order must belong to a family.'],
    },

   
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
