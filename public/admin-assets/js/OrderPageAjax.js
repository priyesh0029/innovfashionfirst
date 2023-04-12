
const orderId = document.getElementById("orderId").innerHTML
const userId = document.getElementById("custUserID").innerHTML
const orderStatusDropdwon = document.getElementById("orderStatusDropdown")
const orderStatusOption = orderStatusDropdwon.options;
console.log("orderId : ",orderId,userId);
orderStatusDropdwon.addEventListener('change', () => {
    let index = orderStatusOption.selectedIndex
    let orderStatusLabel = orderStatusOption[index].value
    console.log("orderStatusLabel : ",orderStatusLabel);
    amendOrderStatus(orderStatusLabel,orderId,userId)
})

function amendOrderStatus(orderStatus,orderId,userId){
    let reason
    if(orderStatus==="cancelled"){
        reason = "cancelled by admin"
    }else{
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
        }
      });
}