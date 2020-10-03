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

const getTotal = (items, promoCode) => {
    let parsedItems = Object.values(items)
    let total = 0

    parsedItems.forEach(itm => {
        total = total + itm.item.price * itm.qty
    })
    //return `<b>₹${total}</b>  `
    return `<td colspan="2">Total Amount</td>
            <td>₹${total}</td>
            <tr>
            <td colspan="2">Discount</td>
            <td>₹${promoCode}</td>
            </tr>
            <tr>
            <td colspan="2">Total Payable</td>
            <td>₹${total - promoCode}</td>
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
    });

    const mailOptions = {
        from: '0206it181059@ggits.net',
        to: 'siddharthkesharwani14@gmail.com',
        subject: 'Sending Email using Node.js',
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
        
        <table style="width:40%; margin:50px auto;">
          <tr>
            <th>Item</th>
            <th>Qty</th> 
            <th>Price</th>
          </tr>
            ${renderItems(order.items)}
            ${getTotal(order.items,order.promoCode)}
          
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