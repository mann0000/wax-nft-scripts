// Various functions needed by the scripts
function chunks(arr, size = 2) {
    return arr
        .map((x, i) => i % size == 0 && arr.slice(i, i + size))
        .filter((x) => x);
};

exports.chunks = chunks;

function makeid(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.makeid = makeid;

function shuffleFisherYates(array) {
    let i = array.length;
    while (i--) {
        const ri = Math.floor(Math.random() * (i + 1));
        [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
}

exports.shuffleFisherYates = shuffleFisherYates;

function precise(x, y = 4) {
    return Number.parseFloat(x).toFixed(y);
}

exports.precise = precise;