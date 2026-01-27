const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function encode(num){
    if(num === 0) return "0";

    let str = "";
    while(num > 0){
        str = chars[num%62]+str;
        num = Math.floor(num/62);
    }
    return str;
}

module.exports = {encode}