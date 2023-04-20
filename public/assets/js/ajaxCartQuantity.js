//addWishList
function addWishlist(e, id, page = undefined) {
  e.preventDefault()
  console.log("product id : ", id);

  $.ajax({
    url: '/postaddtoWishlist',
    type: 'post',
    data: {
      proID: id
    },
    success: function (response) {
      document.getElementById("wishlistCount").innerHTML = response.count;
      swal({
        title: "Item added to wishlist!",
        icon: "success",
        button: "OK",
      });
    }
  });

}

function addWishlist2(e) {
  e.preventDefault()
  swal({
    title: "Please login to Continue!",
    button: "OK",
  });
}

//deleteWishList

function deleteWishlist(proId) {
  $.ajax({
    url: '/postDeleteWishlist',
    type: 'post',
    data: {
      proID: proId
    },
    success: function (response) {
      document.getElementById("wishlistCount").innerHTML = response.wishListCount;
      swal({
        title: "Item deleted from wishlist!",
        icon: "success",
        button: "OK",
      })

      $(document).ready(function () {
        $('#wishlistViewtable').load(window.location.href + ' #wishlistViewtable');
      })
    }
  });
}

//addToCart
function addTocart(id, priceOfitem, page = undefined) {
  console.log(id, priceOfitem);
  swal({
    title: "Item added to cart!",
    icon: "success",
    button: "OK",
  });
  let quantity
  if (!page) {
    quantity = String(1)
  } else {
    quantity = document.getElementById("quantity").innerHTML
  }
  let subTotal = parseFloat(priceOfitem) * parseInt(quantity)

  $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity,
      unitPrice : priceOfitem,
      sub_total: subTotal
    },
    success: function (response) {
      document.getElementById("cartIconCount").innerHTML = response.count;
    }
  });

}

function addTocart2() {
  swal({
    title: "Please login to Continue!",
    button: "OK",
  });
}

//quantity controller

function quantityControl(e, quantity, button) {
  e.preventDefault()
  let quantityInner = document.getElementById("quantity").innerHTML
  quantityInner = parseInt(quantityInner)
  let qty = parseInt(quantity)
  if (button == 'qtyup') {
    if (quantityInner + 1 >= qty) {
      document.getElementById("quantityUPIcon").style.display = "none";
      document.getElementById("quantity").innerHTML = String(qty)
    }
  } else {
    if (quantityInner - 1 <= qty) {
      document.getElementById("quantityUPIcon").style.display = "block";
    }
  }
}

//cart quantity

function cartquantityplus(id, priceOfitem, subtotalOfItems, tot_qty) {

  let element = document.getElementById(id);
  let quantity1 = element.innerHTML

  let price = parseInt(priceOfitem)
  var temp = parseInt(quantity1) + 1
  let total = (price * temp)
  let subTotal = String(total)
  let quantity = String(temp)
  if (temp-1 >= String(tot_qty)) {
    document.getElementById(tot_qty).style.display = "none";
    document.getElementById(element).innerHTML = String(tot_qty)
  }

  $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity,
      sub_total: subTotal
    },
    success: function (response) {
      console.log(response);
      let product = response.product.find(p => p.product_id == id);
      let quantity2 = product.quantity;
      let subTotal = product.sub_total

      document.getElementById(id).innerHTML = String(quantity2)
      document.getElementById(subtotalOfItems).innerHTML = subTotal;
      document.getElementById('subtotal').innerHTML = response.grand_Total;
      document.getElementById('subtotal2').innerHTML = response.grand_Total;
      document.getElementById("cartIconCount").innerHTML = response.count;



    }
  });

}


function cartquantitydown(id, priceOfitem, subtotalOfItems, tot_qty) {

  let element = document.getElementById(id);
  let quantity1 = element.innerHTML


  let price = parseInt(priceOfitem)
  let temp = parseInt(quantity1) - 1
  let total = (price * temp)
  let subTotal = String(total)
  let quantity = String(temp)
  if (temp-1 <= String(tot_qty)) {
    document.getElementById(tot_qty).style.display = "block";
  }

  $.ajax({
    url: '/postaddcart',
    type: 'GET',
    data: {
      proID: id,
      quantity: quantity,
      sub_total: subTotal
    },
    success: function (response) {

      let product = response.product.find(p => p.product_id == id);
      let quantity2 = product.quantity;
      let sub_Total = product.sub_total
      console.log(typeof (quantity2));
      if (quantity2 < 1) {
        deleteProduct(id)
      }
      document.getElementById(subtotalOfItems).innerHTML = sub_Total;
      document.getElementById(id).innerHTML = String(quantity2)
      document.getElementById('subtotal').innerHTML = response.grand_Total;
      document.getElementById('subtotal2').innerHTML = response.grand_Total;


    }
  });

}

function deleteProduct(id) {

  console.log(id);

  $.ajax({
    url: '/deletecartItem',
    type: 'GET',
    data: {
      proID: id,

    },
    success: function (response) {
      console.log(response.status);
      if (response.status === true) {
        window.location.reload()
        document.getElementById("cartIconCount").innerHTML = response.cartCount;
      }


    }
  });
}


// function addAddress(id) {
//   console.log("addressId of user :", id);
//   $.ajax({
//     url: '/postcheckoutAddress',
//     type: 'POST',
//     data: {
//       addressID: id
//     },
//     success: function (response) {
//       console.log(response);

//     }
//   });
// }

// function date() {
//   console.log("haii date");
// }

//view address

function viewAddress() {
  console.log("viewAddress ajax");
  $.ajax({
    url: '/viewAddress',
    type: 'GET',
    success: function (response) {
      console.log(response);
      let address = ''

      for (let i = 0; i < response.length; i++) {
        const ele = response[i];
        address += `
        <div class="table-responsive order_table text-center">
        <table class="table">
                <tbody id=address-view>
                        <tr id="${ele._id}">
                            <td class="mb-5">
                                <ul class="text-start mt-15 ms-2 ">
                                    <li>
                                        <h5>
                                            ${ele.name},${ele.phonenumber}
                                        </h5>
                                    </li>
                                    <li>
                                        <h5>
                                        ${ele.addressLine},${ele.locality}
                                        </h5>
                                    </li>
                                    <li>
                                        <h5>
                                        ${ele.city},(near)${ele.landmark}
                                        </h5>
                                    </li>
                                    <li>
                                        <h5>
                                        ${ele.state},${ele.pincode}
                                        </h5>
                                    </li>
                                    <li class="text-center">
                                    <div class="d-flex" >
                                      <div class="me-1">
                                          
                                              <button type="button" class="btn btn-small btn-rounded mb-4" data-toggle="modal"
                                              data-target="#modalContactForm${i}">edit</button>
                                          
                                      </div>
                                      <div>
                                            
                                            <button class="btn btn-small btn-rounded mb-4" onclick="deleteAddress('${ele._id}')">delete</button>
                                          
                                      </div>
                                    </div>

                                        <!-- modal-form-start -->
                                        <div class="modal fade" id="modalContactForm${i}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
                                            aria-hidden="true">
                                            <div class="modal-dialog" role="document">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h4 class="modal-title w-100 font-weight-bold">Your New Address</h4>
                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <form action="/posteditAddress?addressId=${ele._id}" method="post" id="form">
                                                        <div class="modal-body mx-3">
                                                            <div class="form-row d-flex justify-content-center">
                                                                <div class="md-form mb-5 me-2 text-start col-md-6">
                                                                    <input type="text" id="form34" class="form-control validate"  value="${ele.name}"
                                                                        name="fname">
                                                                </div>
                                    
                                                                <div class="md-form mb-5 text-start col-md-6">
                                                                    <input type="tel" id="form34" class="form-control validate"
                                                                         name="phonenumber"  value="${ele.phonenumber}">
                                                                </div>
                                                            </div>
                                                            <div class="form-row d-flex justify-content-center">
                                                                <div class="md-form mb-5 me-2 text-start col-md-6">
                                                                    <input type="text" id="form34" class="form-control validate"  value="${ele.pincode}"
                                                                        name="pincode">
                                                                </div>
                                    
                                                                <div class="md-form mb-5 text-start col-md-6">
                                                                    <input type="text" id="form29" class="form-control validate"  value="${ele.locality}"
                                                                        name="locality">
                                                                </div>
                                                            </div>
                                                            <div class="md-form mb-5 text-start">
                                                                <input type="text" id="form29" class="form-control validate"
                                                                value="${ele.addressLine}" name="address">
                                    
                                                            </div>
                                                            <div class="form-row d-flex justify-content-center">
                                                                <div class="md-form mb-5 text-start col-md-6">
                                                                    <input type="text" id="form29" class="form-control validate"
                                                                    value="${ele.city}" name="city">
                                    
                                                                </div>
                                    
                                                                <div class="md-form mb-5 text-start col-md-6">
                                                                    <input type="text" id="form29" class="form-control validate"  value="${ele.state}"
                                                                        name="state">
                                    
                                                                </div>
                                                            </div>
                                                            <div class="form-row d-flex justify-content-center">
                                                                <div class="md-form mb-5 text-start col-md-6">
                                    
                                                                    <input type="text" id="form29" class="form-control validate"
                                                                    value="${ele.landmark}" name="landmark">
                                    
                                                                </div>
                                    
                                                                <div class="md-form mb-5 text-start col-md-6">
                                    
                                                                    <input type="tel" id="form29" class="form-control validate"
                                                                    value="${ele.altPhone}" name="phoneAlt">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="modal-footer d-flex justify-content-center">
                                                            <button type="submit" id="submit" class="btn btn-unique">Save</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    </div>
                                </ul>
                            </td>
                        </tr>
                       
                </tbody>
        </table>
    </div>
    
   
        `
      };
      $('#address1').html(address)
    }
  })
}



function deleteAddress(addressId) {
  console.log("addressId of user :", addressId);
  $.ajax({
    url: '/deleteAddress',
    type: 'GET',
    data: {
      addressID: addressId
    },
    success: function (response) {
      console.log("response : ", response);
      $(`#${addressId}`).remove()
    }

  });
}

//amend password

function checkPassword() {
  let oldPassword = document.getElementById("oldpassword").value
  console.log(oldPassword);
  $.ajax({
    url: '/checkPassword',
    type: 'post',
    data: {
      password: oldPassword
    },
    success: function (response) {
      if (!response.status) {
        document.getElementById("oldpassword-error").innerHTML = "incorrect password"
      } else {
        document.getElementById("oldpassword-error").innerHTML = ""
      }

    }

  });
}

function confirmPassword($event) {
  $event.preventDefault()
  let newPassword = document.getElementById("npassword").value
  let confirmPassword = document.getElementById("cpassword").value
  if (newPassword === confirmPassword) {
    document.getElementById("cpassword-error").innerHTML = ""
    $.ajax({
      url: '/checkPassword',
      type: 'post',
      data: {
        password: newPassword,
        cpassword: confirmPassword
      },
      success: function (response) {
        if (response.status) {
          $(document).ready(function () {
            setTimeout(function () {
              $('#passwordForm').load(window.location.href + ' #passwordForm');
            }, 0)
          })
          passwordSwal()
          function passwordSwal() {
            swal({
              title: "password changed successfully!",
              button: "OK",
            });
          }
        }
      }
    });
  } else {
    document.getElementById("cpassword-error").innerHTML = "password mismatch"
  }
}


