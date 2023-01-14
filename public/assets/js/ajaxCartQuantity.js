
function addTocart(id){

   let quantity = document.getElementById("quantity").innerHTML

   console.log("id : ",id, "quantity :",quantity);

   $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity
    },
    success: function (response) {
      console.log(response);

      // let product = response.product.find(p => p.product_id == id);
      // let quantity1 = product.quantity;
      // console.log(quantity1); 

      // document.getElementById("quantity").innerHTML = quantity1;
    }
  });

}

function cartquantityplus(id){

  let quantity1 = document.getElementById("quantity").innerHTML

  

   console.log("id : ",id, "quantity :",quantity1);
  
   let quantity = parseInt(quantity1)
   let temp = quantity + 1

   let priceStr = document.getElementById("price").innerHTML
      console.log(typeof priceStr); 

      
      let price = parseInt(priceStr)

      let total = (price*temp)
      console.log(total); 
      let subTotal = String(total)
      console.log(subTotal);
       document.getElementById("subTotal").innerHTML = subTotal;

   quantity = String(temp)

   $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity
    },
    success: function (response) {
      console.log(response);

      let product = response.product.find(p => p.product_id == id);
      let quantity1 = product.quantity;
      console.log(quantity1); 

      
    }
  });

}


function cartquantitydown(id){

  let quantity1 = document.getElementById("quantity").innerHTML

   console.log("id : ",id, "quantity :",quantity1);
  
   let quantity = parseInt(quantity1)
   let temp
   if(quantity==1){
    temp=quantity
   }else{
     temp = quantity -1
   }

   let priceStr = document.getElementById("price").innerHTML
   console.log(typeof priceStr); 

   
   let price = parseInt(priceStr)

   let total = (price*temp)
   console.log(typeof total); 
   let subTotal = String(total)
   console.log(typeof subTotal);
    document.getElementById("subTotal").innerHTML = subTotal;
  
   quantity = String(temp)

   $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity
    },
    success: function (response) {
      console.log(response);

      let product = response.product.find(p => p.product_id == id);
      let quantity1 = product.quantity;
      console.log(quantity1); 

     
    }
  });

}

let price = document.getElementById("price").innerHTML
let quantity = document.getElementById("quantity").innerHTML

console.log(price, quantity);