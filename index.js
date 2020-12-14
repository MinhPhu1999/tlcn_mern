//Khai báo các thư viện cần thiết
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
const adminRouter = require('./api/routers/admin.router');


mongoose.Promise = global.Promise;
const {mongoURL} = require('./mongo')
mongoose.connect(mongoURL,{ //kết nối tới database
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology:true,
    useCreateIndex: true}).catch(error => console.log(error.reason));

//có phép nhận dữ liệu từ form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cors());

//cors
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
})


userRouter(app);
categoryRouter(app);
brandRouter(app);
productRouter(app);
cartRouter(app);
orderRouter(app);
adminRouter(app);


app.get('/', (req, res) => {res.send('welcome to e_store')})

app.listen(port, () => console.log("server running on port " + port));