//Khai báo các thư viện cần thiết
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./api/config/connectDB');


const userRouter = require('./api/routers/user.router');
const categoryRouter = require('./api/routers/category.router');
const productRouter = require('./api/routers/product.router');
const brandRouter = require('./api/routers/brand.router');
const cartRouter = require('./api/routers/cart.router');
const orderRouter = require('./api/routers/order.router');
const adminRouter = require('./api/routers/admin.router');

//model comment
const Comments = require('./api/models/comment.model');

//kết nối tới database mongo
connectDB();


//có phép nhận dữ liệu từ form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//cors
app.use(cors());

const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Soketio
let users = []
io.on('connection', socket => {
	

    socket.on('joinRoom', id => {
        const user = {userId: socket.id, room: id}

        const check = users.every(user => user.userId !== socket.id)

        if(check){
            users.push(user)
            socket.join(user.room)
        }else{
            users.map(user => {
                if(user.userId === socket.id){
                    if(user.room !== id){
                        socket.leave(user.room)
                        socket.join(id)
                        user.room = id
                    }
                }
            })
        }
    })

    socket.on('createComment', async msg => {
        const {username, content, product_id, createdAt, rating, send} = msg

        const newComment = new Comments({
            username, content, product_id, createdAt, rating
        })

        if(send === 'replyComment'){
            const {_id, username, content, product_id, createdAt, rating} = newComment

            const comment = await Comments.findById(product_id)

            if(comment){
                comment.reply.push({_id, username, content, createdAt, rating})

                await comment.save()
                io.to(comment.product_id).emit('sendReplyCommentToClient', comment)
            }
        }else{
            await newComment.save()
            io.to(newComment.product_id).emit('sendCommentToClient', newComment)
        }

        
    })

    socket.on('disconnect', () => {
		
        users = users.filter(user => user.userId !== socket.id)
    })
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