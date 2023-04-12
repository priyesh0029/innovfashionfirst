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

