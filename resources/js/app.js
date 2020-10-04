import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import { initPromo,removeDish } from './script'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')
let applyBtn = document.querySelector('#apply-promo')
let cancelBtn = document.querySelectorAll('.cancel')

function updateCart(dish){
    axios.post('/update-cart', dish).then((res) => {
        console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: "warning",
            text: 'Added to cart',
            timeout:1000
        }).show()
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        console.log(e)
        let dish = JSON.parse(btn.dataset.dish)
        updateCart(dish)
        console.log(dish)
    })
})

cancelBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        removeDish(btn.value)
    })
})

// remove alert of order placed
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    },2000)
}

if(applyBtn){
    applyBtn.addEventListener('click', (e) =>{
        let code = document.getElementById('coupon').value
        console.log(code)
        initPromo(code)
    })
}


//initAdmin()

// change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')

let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)

let time = document.createElement('small')
function updateStatus(order){
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true
    statuses.forEach((status) => {
        let data = status.dataset.status
        if(stepCompleted){
            status.classList.add('step-completed')
        }
        if(data === order.status){
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('MMM Do YYYY,hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order)

// Socket
let socket = io()
initAdmin(socket)
if(order){
    //creating private room for a particular order
    socket.emit('join',`order_${order._id}`)
}

let adminPath = window.location.pathname
if(adminPath.includes('admin')){
    socket.emit('join','adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: "warning",
        text: 'Status changed',
        //timeout: 1000
    }).show()
    console.log(data)
})
