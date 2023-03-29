// Script for address-form validation



function validateName(){
  
      let name = document.getElementById('formName').value

      if(name.length == 0 ){
          document.getElementById("name-error").innerHTML = 'Name required'
          return false
      }
   
      document.getElementById("name-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
      
      return true
      
}


function validateMobile(){
    
  let mobile = document.getElementById('formMobile').value

  if(mobile.length == 0 ){
    document.getElementById("mobile-error").innerHTML = 'mobile number required'
      return false
  }

  if(!mobile.match(/^[6-9]\d{9}$/) ){

    document.getElementById("mobile-error").innerHTML = 'invalid mobile number'
    return false

}
  
    document.getElementById("mobile-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
  
  return true
  
}

function validatePincode(){
  
  let pincode = document.getElementById('formPincode').value

  if(pincode.length == 0 ){
         document.getElementById("pincode-error").innerHTML = 'pincode required'
      return false
  }
  
   document.getElementById("pincode-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
  
  return true
  
}

function validateLocality(){
  
    let locality = document.getElementById('formLocality').value
  
    if(locality.length == 0 ){
        document.getElementById("locality-error").innerHTML = 'locality required'
        return false
    }
    
    document.getElementById("locality-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
    
    return true
    
}

function validateAddress(){
  
    let address = document.getElementById('formAddress').value
  
    if(address.length == 0 ){
        document.getElementById("address-error").innerHTML = 'address required'
        return false
    }
    
    document.getElementById("address-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
    
    return true
    
}
function validateCity(){
  
    let city = document.getElementById('formCity').value
  
    if(city.length == 0 ){
          document.getElementById("city-error").innerHTML = 'feild required'
        return false
    }
    
    document.getElementById("city-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
    
    return true
    
}

function validateState(){
  
    let state = document.getElementById('formState').value
  
    if(state.length == 0 ){
        document.getElementById("state-error").innerHTML = 'state required'
        return false
    }
    
    document.getElementById("state-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
    
    return true
    
}


function validateAltMobile(){
    
    let altmobile = document.getElementById('formAltmobile').value
  
    if(altmobile.length == 0 ){
        document.getElementById("altmobile-error").innerHTML = 'feild required'
        return false
    }
  
    if(!altmobile.match(/^[6-9]\d{9}$/) ){
  
      document.getElementById("altmobile-error").innerHTML = 'invalid mobile number'
      return false
  
  }
    
        document.getElementById("altmobile-error").innerHTML = '<i class="fa-regular fa-circle-check"></i>'
    
    return true
    
}

function validateForm(){

  if( !validateName() || !validateMobile() || !validatePincode() ||
   validateLocality() || validateAddress() || validateCity() ||
    validateState() || validateAltMobile() ){

      document.getElementById('submit-error').innerHTML = 'Please fill the form correctly and Submit Again'
      document.getElementById("name-error").innerHTML = 'Name required'
      document.getElementById("mobile-error").innerHTML = 'invalid mobile number'
       document.getElementById("pincode-error").innerHTML = 'pincode required'
      document.getElementById("locality-error").innerHTML = 'locality required'
      document.getElementById("address-error").innerHTML = 'address required'
      document.getElementById("city-error").innerHTML = 'feild required'
      document.getElementById("state-error").innerHTML = 'feild required'
      document.getElementById("altmobile-error").innerHTML = 'invalid mobile number'
    

      setTimeout(function(){document.getElementById('submit-error').innerHTML = ''},3000)
      
      return false
  }

  success.innerHTML = "form submitted successfully"
  document.getElementById("name-error").innerHTML = ''
  phoneError.innerHTML = ''
  emailError.innerHTML = ''


  return true
  

  
}