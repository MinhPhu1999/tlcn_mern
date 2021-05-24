exports.ordered = (type, orderFind) => {
    if (type === 1) {
        if (
            orderFind.orderStatus[0].isCompleted &&
            !orderFind.orderStatus[1].isCompleted &&
            !orderFind.orderStatus[2].isCompleted &&
            !orderFind.orderStatus[3].isCompleted
        )
            return true;
    }
    if (type === 2) {
        if (
            orderFind.orderStatus[1].isCompleted &&
            !orderFind.orderStatus[2].isCompleted &&
            !orderFind.orderStatus[3].isCompleted
        )
            return true;
    }
    if (type === 3) {
        if (orderFind.orderStatus[2].isCompleted && !orderFind.orderStatus[3].isCompleted)
            return true;
    }
    if (type === 4) {
        if (orderFind.orderStatus[3].isCompleted) return true;
    }
    return false;
};
