var mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectId



const db = mongoose.connect("mongodb://0.0.0.0:27017/Innovfashion", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));



//userSchema

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,

  },
  lastName: {
    type: String,
    required: true,

  },
  Password: {
    type: String,
    required: true,
    // minlength: 5,


  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: Number,
    // minlength:10,
    unique: true,
  },
  userBlockStatus: {
    type: Boolean, default: false
  },
  //  CreatedAt:{
  //    type:Date,
  //    deafault:Date.now,
  //  },

})


//productSchema

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  product_details: [{
      quantity: {
        type: Number,
        required: true
      },

      size: {
        type: String,
        required: true
      },

      color: {
        type: String,
        required: true
      }

  }],


  gender: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  catagory: {
    type: String,
    required: true
  },

  sub_catagory: {
    type: String,
    required: true
  },

  Image: {
    type: String,
    required: true
  },
  product_status :{
    type : Boolean,default :true
  }


})




//catagories

const categorySchema = new mongoose.Schema({ 
category:{  
  Men: {
    Topwear: {
      type: [String],
      // required: true,
      uppercase: true
    },
    Bottomwear:  {
      type: [String],
      // required: true,
      uppercase: true
    },
    Footwear:  {
      type: [String],
      // required: true,
      uppercase: true
    },
  },
  Women: {
    Topwear: {
      type: [String],
      // required: true,
      uppercase: true
    },
    Bottomwear: {
      type: [String],
      // required: true,
      uppercase: true
    },
    Footwear: {
      type: [String],
      // required: true,
      uppercase: true
    }
  },
  Kids: {
    Topwear: {
      type: [String],
      // required: true,
      uppercase: true
    },
    Bottomwear: {
      type: [String],
      // required: true,
      uppercase: true
    },
    Footwear: {
      type: [String],
      // required: true,
      uppercase: true
    }
  }
} 
});


//cartSchema

const cartSchema = new mongoose.Schema({

  userId : ObjectId,
  product :  [
    {
      product_id:{
        type: ObjectId,
        ref : "product"
      },
      quantity :{
        type: Number
      }
    }
  ],
  count : Number,
  sub_total : Number

})







//adminSchema

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  }

})

module.exports = {
  
  user: mongoose.model('user', userSchema),
  product: mongoose.model('product', productSchema),
  categories: mongoose.model('categories', categorySchema),
  cart: mongoose.model('cart', cartSchema),
  admin: mongoose.model('admin', adminSchema)
 
}

