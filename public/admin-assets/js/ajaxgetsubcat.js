let genderDropdown = document.getElementById('gender')
let GenderOptions = genderDropdown.options

let categoryDropdown = document.getElementById('category')
let categoryOptions = categoryDropdown.options

genderDropdown.addEventListener('change', () => {

  let category;

  categoryDropdown.addEventListener('change', () => {

    let index = categoryOptions.selectedIndex
    category = categoryOptions[index].label

    getSubCat(gender, category)
  })

  let index = GenderOptions.selectedIndex
  let gender = GenderOptions[index].label


})

function getSubCat(gender, category1) {
  let subcategory =document.getElementById('subcategory')
  let genderHtml =document.getElementById('gender')

  // genderHtml.setAttribute('disabled','')
  
  if (gender != null && category1 != null) {
    console.log(gender, category1);

    $.ajax({
      url: '/admin/getAddProductAjaxValues',
      type: 'GET',
      data: {
        gender: gender,
        category: category1
      },
      success: function (response) {
        console.log(response);
        let [data] = response
        let array = data.category[gender][category1]
        var resultHTML = "";
        for (var i = 0; i < array.length; i++) {
          resultHTML += "<option value='" + array[i] + "'>" + array[i] + "</option>";
        }
        subcategory.innerHTML = resultHTML
      }
    });

  }
}

//offers-start

function offerExist() {
  let category = document.getElementById('category').value
  let gender = document.getElementById('gender').value
  let subcategory = document.getElementById('subcategory').value
  console.log(gender, category, subcategory);

  $.ajax({
      url: '/admin/offerExist',
      type: 'GET',
      data: {
          gender,
          category,
          subcategory
      },
      success: function (response) {
          console.log(response);
          swal({
              title: "Offer Exist",
              text: `There exist an offer for the same sub category with ${response[0].offerPercentage}%.Do you want to incative it ?`,
              icon: "warning",
              buttons: true,
              dangerMode: true,
          }).then((willDelete) => {
                  if (willDelete) {
                      console.log("willDelete : ",response[0]);
                      unlistOffer(response[0])
                      swal("Your offer is inactive now!", {
                          icon: "success",
                      })
                  } else {
                      swal("Your offer is still active. please change the categories to add another offers !");
                  }
              })
      }


  });

}

function unlistOffer(offerDetails){
  console.log("willDelete2 : ",offerDetails);
  $.ajax({
      url: '/admin/unlistOffer',
      type: 'POST',
      data: {
          offfeID: offerDetails._id,
          gender : offerDetails.gender,
          category : offerDetails.category,
          subcategory : offerDetails.subcategory,
          offerStatus : offerDetails.offerStatus,
          offerPercentage : offerDetails.offerPercentage,
          endDate: offerDetails.endDate,

      },
      success: function (response) {
          
      }


  });
}

