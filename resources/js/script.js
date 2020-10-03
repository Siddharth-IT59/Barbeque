import axios from 'axios'
import Noty from 'noty'

export function initPromo(code){
    console.log('hi')
    var promo_code = { coupon: code }
    console.log(JSON.stringify(promo_code))
    //applyPromo(promo_code)
    axios.post('/promo-code',promo_code).then((res) => {
        console.log(JSON.stringify(res.data.totalPrice))
        let subTotal = res.data.totalPrice
        let totalAmt = document.querySelector('#totalAmt')
        let pcode = document.querySelector('#pcode')
        pcode.value = res.data.discount
        //console.log(res.session.cart.totalPrice)
        //console.log(subTotal+''+res.data.discount)
        
        let amount = subTotal - res.data.discount
        totalAmt.textContent = '₹'+amount.toString()
        
        new Noty({
            type: "warning",
            text: `You received a discount of ₹${res.data.discount}`,
            timeout:1000
        }).show()
    })
}


