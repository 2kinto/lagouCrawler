function foo(x,y) {
    return new Promise(function(resolve,reject){

        setTimeout(function(){
           resolve("~~~foo完成了~~"+(x+y));
        },5000);
    });
}

function *main() {
    try{
        var text = yield foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}

var it = main();

var p = it.next().value;
p.then(
    function (text) {
        //输出执行结果
        console.log("我知道了>>"+text);
        //将结果返回给迭代器
        it.next( text );
    },

    function (err) {
        it.throw( err );
    }
);
