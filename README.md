# waiMai_plugin

帮别人做的chrome插件，外卖收到订单未接单就弹框和语音提醒

### 值得自己做笔记的

1. 感觉特别棒的弹出方法
2. 那坨正则表达式太辣眼睛了，下次该把那一串分开成单独的字符串，再链接起来

### 后续问题

~~找到JS实现“变量指针”这一功能的类似方法，然后解决那段重复代码~~
问过工作室的大佬们后，还是函数实现简单一些

###附:JS的传值方式
```js
function changeStuff(num, obj1, obj2)
{
    num = num * 10;
    obj1.item = "changed";
    obj2 = {item: "changed"};
}

var num = 10;
var obj1 = {item: "unchanged"};
var obj2 = {item: "unchanged"};
changeStuff(num, obj1, obj2);
console.log(num);   // 10
console.log(obj1.item);    // changed
console.log(obj2.item);    // unchanged
```
JavaScript中函数参数的传递方式既不是传值，也不是传引用，而是叫call-by-sharing(传引用的拷贝)

git config --global core.autocrlf false 
