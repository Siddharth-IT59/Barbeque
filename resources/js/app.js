import axios from 'axios'
import Noty from 'noty'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(dish){
    axios.post('/update-cart', dish).then((res) => {
        console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: "warning",
            text: 'Added to cart'
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

