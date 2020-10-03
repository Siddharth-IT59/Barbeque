import axios from 'axios'
import Noty from 'noty'

function changeText(text){
    new Noty({
        type: "warning",
        text: text,
        timeout:1000
    }).show()    
}

export function initPromo(code){
    console.log('hi')
    var promo_code = { coupon: code }
    console.log(JSON.stringify(promo_code))

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
            let text = `Invalid promo code.` 
            changeText(text)
        }    
    })
}


