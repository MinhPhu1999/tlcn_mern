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
//const mongoURL='mongodb://localhost/e_db';
const {mongoURL} = require('./mongo')
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology:true,
    useCreateIndex: true}).catch(error => console.log(error.reason));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());


userRouter(app);
categoryRouter(app);
brandRouter(app);
productRouter(app);
cartRouter(app);
orderRouter(app);
adminRouter(app);


app.get('/', (req, res) => {res.send('welcome to fashtion_book')})

app.listen(port, () => console.log("server running on port " + port));