const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stock = new Schema({
    name_category:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    path:{
        type: String,
        required:[true,'Không được bỏ trống']
    },
	name_brand:{
		type:String,
        required:[true,"Không được bỏ trống"]
	},
	date_import:{
        type: Date,
        default: Date.now()
	},
    count_import:{
        type:Number,
        required:[true,"Không được bỏ trống"]
    },
    status:{
        type:Boolean
    }
});

module.exports = mongoose.model('stock', stock);