// Script for address-form validation



function validateName() {

    let name = document.getElementById('formName').value

    if (name.length == 0) {
        document.getElementById("submit").disabled = true
        let itemElement = document.getElementById("name-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("name-error").innerHTML = 'Name required'
        return false
    }

    document.getElementById("submit").disabled = false
    let itemElement = document.getElementById("name-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("name-error").innerHTML = '<i class="bi bi-check-circle"></i>'

    return true

}


function validateMobile() {

    let mobile = document.getElementById('formMobile').value

    if (mobile.length == 0) {
        let itemElement = document.getElementById("mobile-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("mobile-error").innerHTML = 'mobile number required'
        document.getElementById("submit").disabled = true

        return false
    }

    if (!mobile.match(/^[6-9]\d{9}$/)) {

        let itemElement = document.getElementById("mobile-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("mobile-error").innerHTML = 'invalid mobile number'
        document.getElementById("submit").disabled = true

        return false

    }

    let itemElement = document.getElementById("mobile-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("mobile-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}

function validatePincode() {

    let pincode = document.getElementById('formPincode').value

    if (pincode.length == 0) {
        let itemElement = document.getElementById("pincode-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("pincode-error").innerHTML = 'pincode required'
        document.getElementById("submit").disabled = true

        return false
    }

    let itemElement = document.getElementById("pincode-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("pincode-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}

function validateLocality() {

    let locality = document.getElementById('formLocality').value

    if (locality.length == 0) {
        let itemElement = document.getElementById("locality-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("locality-error").innerHTML = 'locality required'
        document.getElementById("submit").disabled = true

        return false
    }

    let itemElement = document.getElementById("locality-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("locality-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}

function validateAddress() {

    let address = document.getElementById('formAddress').value

    if (address.length == 0) {
        let itemElement = document.getElementById("address-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("address-error").innerHTML = 'address required'
        document.getElementById("submit").disabled = true

        return false
    }

    let itemElement = document.getElementById("address-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("address-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}
function validateCity() {

    let city = document.getElementById('formCity').value

    if (city.length == 0) {
        let itemElement = document.getElementById("city-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("city-error").innerHTML = 'feild required'
        document.getElementById("submit").disabled = true

        return false
    }
    let itemElement = document.getElementById("city-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("city-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}

function validateState() {

    let state = document.getElementById('formState').value

    if (state.length == 0) {
        let itemElement = document.getElementById("state-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("state-error").innerHTML = 'state required'
        document.getElementById("submit").disabled = true

        return false
    }

    let itemElement = document.getElementById("state-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("state-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}


function validateAltMobile() {

    let altmobile = document.getElementById('formAltmobile').value

    if (altmobile.length == 0) {
        let itemElement = document.getElementById("altmobile-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("altmobile-error").innerHTML = 'feild required'
        document.getElementById("submit").disabled = true

        return false
    }

    if (!altmobile.match(/^[6-9]\d{9}$/)) {
        let itemElement = document.getElementById("altmobile-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("altmobile-error").innerHTML = 'invalid mobile number'
        document.getElementById("submit").disabled = true

        return false

    }

    let itemElement = document.getElementById("altmobile-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("altmobile-error").innerHTML = '<i class="bi bi-check-circle"></i>'
    document.getElementById("submit").disabled = false

    return true

}

function validateForm() {

    if (!validateName() || !validateMobile() || !validatePincode() ||
        !validateLocality() || !validateAddress() || !validateCity() ||
        !validateState() || !validateAltMobile()) {

        document.getElementById('submit-error').innerHTML = 'Please fill the form correctly and Submit Again'


        setTimeout(function () { document.getElementById('submit-error').innerHTML = '' }, 3000)

        return false
    }

    document.getElementById('submit-error').innerHTML = ''
    document.getElementById("name-error").innerHTML = ''
    document.getElementById("mobile-error").innerHTML = ''
    document.getElementById("pincode-error").innerHTML = ''
    document.getElementById("locality-error").innerHTML = ''
    document.getElementById("address-error").innerHTML = ''
    document.getElementById("city-error").innerHTML = ''
    document.getElementById("state-error").innerHTML = ''
    document.getElementById("altmobile-error").innerHTML = ''

    success.innerHTML = "form submitted successfully"



    return true
}
