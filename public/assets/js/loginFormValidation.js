



function validateEmail() {

    let email1 = document.getElementById('email1').value

    if (email1.length == 0) {
        document.getElementById("submit").disabled = true
        let itemElement = document.getElementById("email-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("email-error").innerHTML = 'email required'
        return false
        
    }

    if (!email1.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {

        document.getElementById("submit").disabled = true
        let itemElement = document.getElementById("email-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("email-error").innerHTML = 'invalid email address(try eg : example@example.com)'
        return false
        

    }

    document.getElementById("submit").disabled = false
    let itemElement = document.getElementById("email-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("email-error").innerHTML = '<i class="bi bi-check-circle"></i>'

    return true

}

function validatePassword() {

    let password1 = document.getElementById('password1').value

    if (password1.length == 0) {
        document.getElementById("submit").disabled = true
        let itemElement = document.getElementById("password-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("password-error").innerHTML = 'password required'
        return false
    }

    if (!password1.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[a-zA-Z\d!@#$%^&*()_+]{8,}$/)) {

        document.getElementById("submit").disabled = true
        let itemElement = document.getElementById("password-error")
        itemElement.classList.remove('text-success');
        itemElement.classList.add('text-danger');
        document.getElementById("password-error").innerHTML = 'your password must contain a combination of uppercase and lowercase letters and digits, with a minimum length of 8 characters(eg :Password123@) '
        return false

    }
    document.getElementById("submit").disabled = false
    let itemElement = document.getElementById("password-error")
    itemElement.classList.remove('text-danger');
    itemElement.classList.add('text-success');
    document.getElementById("password-error").innerHTML = '<i class="bi bi-check-circle"></i>'

    return true

}

function validateForm() {

    if (!validateEmail() || !validatePassword()) {

        document.getElementById('submit-error').innerHTML = 'Please fill the form correctly and Submit Again'
        
        setTimeout(function () { document.getElementById('submit-error').innerHTML = '' }, 3000)

        return false
    }

    success.innerHTML = "form submitted successfully"
    



    return true



}