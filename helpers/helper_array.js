exports.getArrayRange = function(from, to) {
    var arr = [];
    for (i = from; i < to; i++) {
        arr[i - from] = i;
    }

    return arr;
}