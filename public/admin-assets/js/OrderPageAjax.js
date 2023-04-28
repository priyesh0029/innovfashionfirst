
const orderId = document.getElementById("orderId").innerHTML
const userId = document.getElementById("custUserID").innerHTML
const orderStatusDropdwon = document.getElementById("orderStatusDropdown")
const orderStatusOption = orderStatusDropdwon.options;
console.log("orderId : ", orderId, userId);
orderStatusDropdwon.addEventListener('change', () => {
    let index = orderStatusOption.selectedIndex
    let orderStatusLabel = orderStatusOption[index].value
    console.log("orderStatusLabel : ", orderStatusLabel);
    amendOrderStatus(orderStatusLabel, orderId, userId)
})

function amendOrderStatus(orderStatus, orderId, userId) {
    let reason
    if (orderStatus === "cancelled") {
        reason = "cancelled by admin"
    } else {
        reason = null
    }
    $.ajax({
        url: '/admin/amendOrderStatus',
        type: 'post',
        data: {
            orderStatus,
            orderId,
            userId,
            reason
        },
        success: function (response) {
            window.location.reload();
        },
        error: function (err) {
            console.log(err);
            if (err.responseJSON.err1) {
                swal({
                    title: err.responseJSON.err1,
                    icon: "warning",
                });
            } else if (err.responseJSON.err2) {

                swal({
                    title: "Order cancelled!",
                    text: err.responseJSON.err2,
                    icon: "warning",
                });

            }
        }
    });
}

function filteredreport() {
    let startDate = document.getElementById("startDate").value
    let endDate = document.getElementById("endDate").value

    console.log(startDate, endDate);
    $.ajax({
        url: '/admin/filteredsalesReport',
        type: 'post',
        data: {
            startDate,
            endDate
        },
        success: function (response) {
            console.log("ajaxresponsse : ", response);
            let filteredsalesReport = ''
            let grantotaltag =''
            let grantotal=0
            for (let i = 0; i < response.length; i++) {
                let ele = response[i]
                grantotal += parseInt(ele.totalPrice)
                filteredsalesReport += `
                <tr>
                <td>
                    ${ele.ordersId}
                </td>
                <td><b>
                    ${ele.firstname}
                    ${ele.lastName}
                    </b></td>
                <td>
                ${ele.email}
                   
                </td>


                <td><span class="badge rounded-pill alert-success text-success">
                ${ele.paymentMethod}
                           
                    </span></td>
                <td>
                ${ele.createdAt}
                  
                </td>
                <td class="text-end">₹ ${ele.totalPrice}
                </td>

            </tr>
                `

            }
            filteredsalesReport+= `
            <tr>
                <td colspan="5"></td>
                 <td class="text-right" ">Total : ₹  ${grantotal}
                 </td>
            </tr>`

            $('#filterSalesReport').html(filteredsalesReport)
           
           console.log(grantotal);
        },
        error: function (err) {
            console.log(err);

        }
    });
}


