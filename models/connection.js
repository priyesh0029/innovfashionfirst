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

  Image: Array,
  product_status: {
    type: Boolean, default: true
  }


})




//catagories

const categorySchema = new mongoose.Schema({
  category: {
    Men: {
      Topwear: {
        type: [String],
         unique: true,
        uppercase: true
      },
      Bottomwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
      Footwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
    },
    Women: {
      Topwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
      Bottomwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
      Footwear: {
        type: [String],
        unique: true,
        uppercase: true
      }
    },
    Kids: {
      Topwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
      Bottomwear: {
        type: [String],
        unique: true,
        uppercase: true
      },
      Footwear: {
        type: [String],
        unique: true,
        uppercase: true
      }
    }
  }
});


//cartSchema

const cartSchema = new mongoose.Schema({

  userId: ObjectId,
  product: [
    {
      product_id: {
        type: ObjectId,
        ref: "product"
      },
      quantity: {
        type: Number
      },
      sub_total: {
        type: Number
      }
    }
  ],
  count: {
    type: Number, 
    default: 0
  },
  grand_Total: Number

})

//WishlistSchema


const wishlistSchema = new mongoose.Schema({

  userId: ObjectId,
  product: Array,
  count: {
    type: Number, 
    default: 0
  }
})

const addressSchema = new mongoose.Schema({

  userId: ObjectId,
  address: [{

    name: {
      type: String,
      required: true
    },
    phonenumber: {
      type: Number,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },

    locality: {
      type: String,
      required: true
    },

    addressLine: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },
    landmark: {
      type: String,
    },
     altPhone: {
      type: Number,
    }
  }]


})

//orderSchema

const orderSchema = new mongoose.Schema({

  userId: ObjectId,
  orders: [{
    name: String,
    productDetails: Array,
    paymentMethod: String,
    paymentStatus: String,
    totalPrice: Number,
    totalQuantity: Number,
    shippingAddress: {
      type: ObjectId,
      ref: 'address'
    },
    paymentMode: String,
    status: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    orderStatus: {
      type: String,
      default: 'pending'
    },
    cancellationReason : {
      type: String,
      default: null
    }
  }
  ]
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
  wishlist: mongoose.model('wishlist', wishlistSchema),
  address: mongoose.model('address', addressSchema),
  order : mongoose.model('order', orderSchema),
  admin: mongoose.model('admin', adminSchema)

}

