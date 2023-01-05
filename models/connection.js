var mongoose = require("mongoose");



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
        type: Number,
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
  }


})

//catagories

const categoriesSchema = new mongoose.Schema({
  category: {
    type: [String],
    uppercase: true,
    required: true
  },

  subcategory: {
    type: [String],
    uppercase: true,
    required: true
  }
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
  categories: mongoose.model('categories', categoriesSchema),
  admin: mongoose.model('admin', adminSchema)
 
}

