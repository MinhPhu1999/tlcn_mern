exports.isValidPassWord = (password) => {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,12}$/
    return re.test(password);
}

exports.isValidPosteCode = (pCode) => {
	var re = /(+([0-9]{6})\b)/g;
	return re.test(pCode);
}

exports.isValidPhone = (phone) => {
	var phoneRe = /((09|03|07|08|05)+([0-9]{8})\b)/g;
	return phoneRe.test(phone);
}

exports.isValidName = (name) => {
	var re = /[^a-z0-9A-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/u
	return re.test(name);
}