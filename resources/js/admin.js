import axios from 'axios'
import moment from 'moment'
import { PromiseProvider } from 'mongoose'
import Noty from 'noty'

function getCoupon(){
    if(document.querySelector('#promo-code').value && document.querySelector('#promo-value').value){
        return {
            promoCode: document.querySelector('#promo-code').value,
            promoValue: document.querySelector('#promo-value').value
        }
    }else{
        changeText('Invalid Input')
    }    
}
function clear(){
    document.querySelector('#promo-code').value = ''
    document.querySelector('#promo-value').value = ''
}
function changeText(text){
    new Noty({
        type: "warning",
        text: text,
        timeout:1000
    }).show()    
}

function getDish(){
    return {
        id: document.querySelector('#dish-id').value,
        name: document.querySelector('#dish-name').value,
        price: document.querySelector('#dish-price').value,
        size: document.querySelector('#dish-size').value
    }
}

export function saveChanges(){
    let saveBtn = document.querySelector('.save-btn')
    if(saveBtn){
        saveBtn.addEventListener('click', (e) => {
            var dish = getDish()
            axios.post('/dishes/save',dish).then((res) => {
                if(res.data.status){
                    let text = 'Changes saved successfully !'
                    changeText(text)
                }
            })
        })
    }
}

export function removeDishData(){
    let removeBtn = document.querySelector('.remove-btn')
    if(removeBtn){
        removeBtn.addEventListener('click', (e) => {
            var dishId = {id: removeBtn.value}
            console.log(dishId)
            axios.post('/dishes/remove',dishId).then((res) => {
                if(res.data.status){
                    let text = `${res.data.status}`
                    changeText(text)
                }
                window.location.href = '/dishes'
            })
         })
    }
}


export function addDiscount(){
    let addBtn = document.querySelector('.add')
    let disableBtn = document.querySelector('.disable')
    if(addBtn){
        addBtn.addEventListener('click', (e) => {
            var coupon = getCoupon()
            axios.post('/add-promo-code',coupon).then((res) => {
                if(res.data.code){
                    let text = `${res.data.code} activated !`
                    changeText(text)
                    clear()
                }
            }).catch((err) => {
                console.log(err)
            })
        })
    }
    if(disableBtn){
        disableBtn.addEventListener('click', (e) => {
            var coupon = getCoupon()
            console.log(coupon)
            axios.post('/disable-promo-code',coupon).then((res) => {
                let text = ''
                if(res.data.status){
                    text = `${res.data.status}`
                }else if(res.data.promo.code){
                    text = `${res.data.promo.code} deactivated !`
                }
                changeText(text)
                clear()
            }).catch((err) => {
                console.log(err)
            })
        })
    }
}

export function dropdown(){
    let dropdown = document.querySelector('.dropdown')
    if(dropdown){
        dropdown.addEventListener('mouseover', (e) => {
            axios.get('/active-codes').then((res) => {
                let options = document.querySelectorAll('option')
                if(options){
                    options.forEach((option) => {
                        option.remove()
                    })
                }
                let promos = res.data.promos
                promos.forEach((promo) => {
                    let option = document.createElement('option')
                    option.value = promo.code
                    option.text = promo.code
                    dropdown.add(option)
                })
            })
        })
    }
}

export function initAdmin(socket) {
    const orderTableBody = document.querySelector('#orderTableBody')
    let orders = []
    let markup

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data
        markup = generateMarkup(orders)
        orderTableBody.innerHTML = markup
    }).catch(err => {
        console.log(err)
    })

    function renderItems(items) {
        let parsedItems = Object.values(items)
        return parsedItems.map((menuItem) => {
            return `
                <p>${ menuItem.item.name } - ${ menuItem.qty } pcs </p>
            `
        }).join('')
    }

    function getTotal(total,promoCode) {
        if(promoCode === ''){
            promoCode = '0'
        }
        return `<p><b>Total Amount</b>&emsp;₹${parseInt(total) + parseInt(promoCode)}  </p> 
            <p><b>Discount</b>&emsp;₹${promoCode}  </p>
            <p><b>Total Payable</b>&emsp;₹${total}`
    }
    function generateMarkup(orders) {
        return orders.map(order => {
            return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${ order._id }</p>
                    <div>${ renderItems(order.items) } ${ getTotal(order.total,order.promoCode) }  </div>
                </td>
                <td class="border px-4 py-2">${ order.customerId.name }</td>
                <td class="border px-4 py-2">${ order.phone }</td>
                <td class="border px-4 py-2">${ order.address }</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-32">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${ order.status === 'order_placed' ? 'selected' : '' }>
                                    Placed</option>
                                <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                    Confirmed</option>
                                <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                    Prepared</option>
                                <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                    Delivered
                                </option>
                                <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    <form action="/admin/order/cancel" method="POST" id="cancel-form">
                        <button onclick="this.form.submit()" name="orderId" value="${order._id}" class="inline-block btn-primary px-6 py-2 rounded text-white font-bold mt-1">
                            Cancel
                        </button>
                    </form>
                </td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('MMM Do YYYY, h:mm A') }
                </td>
            </tr>
        `
        }).join('')
    }
    socket.on('orderPlaced', (order) => {
        new Noty({
            type: "warning",
            text: 'New Order',
            //timeout: 1000
        }).show()
        orders.unshift(order)
        orderTableBody.innerHTML = ''
        orderTableBody.innerHTML = generateMarkup(orders)
    })
    socket.on('cancelledByCustomer', (order) => {
        new Noty({
            type: "warning",
            text: `Order Cancelled (${order.id})`,
            timeout: 2000
        }).show()
        window.setTimeout(function(){
            window.location.reload()
        },5000)
    })
}

