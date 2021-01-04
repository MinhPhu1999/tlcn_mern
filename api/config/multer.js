const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage : multer.diskStorage({
		destination: './files/',
		filename: (req, file, cb) =>{
			let filename=`${Date.now()}-${file.originalname}`;
		   cb(null,filename);
		}
	}),
	fileFilter: (req,file,cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
            cb(new Error("File type is not supported"));
            return;
        }
        cb(null,true);
    }
});
