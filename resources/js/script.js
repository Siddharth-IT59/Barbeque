import axios from 'axios'
import Noty from 'noty'

function changeText(text){
    new Noty({
        type: "warning",
        text: text,
        timeout:1000
    }).show()    
}

function applyPromo(promo_code){
    axios.post('/promo-code',promo_code).then((res) => {
        console.log(JSON.stringify(res.data.totalPrice))
        let subTotal = res.data.totalPrice
        let totalAmt = document.querySelector('#totalAmt')
        
        let pcode = document.querySelector('#pcode')
        pcode.value = res.data.discount
        if(res.data.discount){
            let amount = 0 
            if(subTotal>250){
                amount = subTotal - res.data.discount
                let text = `You received a discount of ₹${res.data.discount}`
                changeText(text) 
            }else{
                amount = subTotal
                let text = `Not valid for cart value less than ₹250` 
                changeText(text)
            }
            //let amount = subTotal - res.data.discount
            totalAmt.textContent = '₹'+amount.toString()
        }else{
            let text = `Promo code deactivated/invalid` 
            changeText(text)
            window.setTimeout(function(){
                window.location.reload()
            },4000)    
        }    
    })
}

export function initPromo(code){
    code = code.toUpperCase()
    var promo_code = { coupon: code }
    console.log(JSON.stringify(promo_code))
    applyPromo(promo_code)
}

export function removeDish(dishId){
    var dish = { id: dishId }
    axios.post('/remove-from-cart',dish).then((res) => {
        window.location.reload()
    })
}
