const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./api/routers/user.router');
const categoryRouter = require('./api/routers/category.router');
const productRouter = require('./api/routers/product.router');
const brandRouter = require('./api/routers/brand.router');
const cartRouter = require('./api/routers/cart.router');
const orderRouter = require('./api/routers/order.router');

mongoose.Promise = global.Promise;
//const mongoURL='mongodb://localhost/e_db';
const {mongoURL} = require('./mongo')
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology:true,
    useCreateIndex: true}).catch(error => console.log(error.reason));


// const address = require('./api/models/address.vn.model');
// const test = () => {
//     Object.keys(data).forEach( function(k){
//         var _dic = [];
//         var _ward = [];
//          Object.keys(data[k].district).forEach(function(j) {
//             Object.keys(data[k].district[j].ward).forEach( function(l) {
//                 _ward.push({
//                     name: data[k].district[j].ward[l].name,
//                     code: data[k].district[j].ward[l].code,
//                 })
//             });
//             _dic.push({
//                 name: data[k].district[j].name,
//                 code: data[k].district[j].code,
//                 ward: _ward
//             })
            
//         });
//         const new_address = new address({
//             city: data[k].name,
//             district: _dic,
//             code: data[k].code
//         })
//         try {
//             new_address.save()
//         }
//         catch(Err) {
//             console.log(Err)
//         }
//     });
// }
// test();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

userRouter(app);
categoryRouter(app);
brandRouter(app);
productRouter(app);
cartRouter(app);
orderRouter(app);

app.get('/', (req, res) => {res.send('welcome to fashtion_book')})

app.listen(port, () => console.log("server running on port " + port));