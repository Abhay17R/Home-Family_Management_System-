import mongoose from 'mongoose';

const expenseSchema=new mongoose.Schema({
    description:{
        type:String,
        required:[true,'Please add a description'],
        trim:true,
    },
    amount:{
        type:Number,
        required:[true,'Please add an amount'],
    },
    category:{
        type:String,
        required:[true,'Please add a category'],
        enum:['Food','Utilities','Transport','Entertainment','Education','Health','Other'],
    
    },

    paidBy:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },
},

    {
        timestamps:true
    }

);
export default mongoose.model('Expense', expenseSchema);