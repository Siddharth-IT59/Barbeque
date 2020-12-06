const nodemailer = require('nodemailer')

const renderItems = (items) => {
    let parsedItems = Object.values(items)
    return parsedItems.map((menuItem) => {
        return `
            <tr>
                <td>${ menuItem.item.name }</td>
                <td>${ menuItem.qty }</td>
                <td>₹${ menuItem.item.price }</td>
            </tr>
        `
    }).join('')
}

const getTotal = (total, promoCode) => {
    if(promoCode === ''){
        promoCode = '0'
    }
    return `<td colspan="2">Total Amount</td>
            <td>₹${parseInt(total) + parseInt(promoCode)}</td>
            <tr>
            <td colspan="2">Discount</td>
            <td>₹${promoCode}</td>
            </tr>
            <tr>
            <td colspan="2">Total Payable</td>
            <td>₹${total}</td>
            </tr>
    `
}

const sendOrderMail = (order) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '0206it181059@ggits.net',
            pass: 'SiddharthKesh99'
        }
    })

    const mailOptions = {
        from: '0206it181059@ggits.net',
        to: order.customerId.email,
        subject: 'Bill',
        html: `<!DOCTYPE html>
        <html>
        <head>
        <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 5px;
        }
        th {
          text-align: left;
        }
        </style>
        </head>
        <body>
        <h1>Thanks for choosing us !</h1>
        <table style="width:40%; margin:50px auto;">
          <tr>
            <th>Item</th>
            <th>Qty</th> 
            <th>Price</th>
          </tr>
            ${renderItems(order.items)}
            ${getTotal(order.total,order.promoCode)}  
        </table>
        
        </body>
        </html>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendOrderMail