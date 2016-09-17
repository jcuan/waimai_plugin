var jcuan = {};
//添加需要的css样式


jcuan.addStyle = function (){
	var 
		head = document.getElementsByTagName('head')[0],
		style = document.createElement('style');
	style.innerHTML = ''+
			'.jcuan_black_overlay{  position:fixed ;display: none;   top: 0%;  left: 0%;  width: 100%;  height: 100%;  background-color: black;  z-index:1001;  -moz-opacity: 0.6;  opacity:.60;  filter: alpha(opacity=60);}'+ 
	  		'.jcuan_white_content { position:absolute ; display: none;    top: 10%;  left: 13%;  width: 70%;  height: 70%;  padding: 16px;  border: 16px solid orange;  background-color: white;  z-index:1002;  overflow: auto;  }'+
	  		'.jcuan_hurry {  margin :0; padding:0; width:100% ; height:30px; background-color: #FF1493 ; color: white; text-align: center; }'+
			'.jcuan_common {  margin-top :15px; margin-bottom:0 ; padding:0; width:100% ; height:30px; background-color: #00BFFF ; color: white;  text-align: center; }'+
			'.jcuan_table { width :100%; border:1px; text-align: center;}'+
			'.jcuan_table td {border:solid 1px;}';
			'.jcuan_table th {border:solid 1px;}';
	head.appendChild(style);
};

//增加table标签前部
jcuan.addTable = function(x){
	var notice;
	if(x==='common'){
		notice = '普通超时';
	}else{
		notice = '超时3分钟';
	}
	return 	'<table class="jcuan_table">'+
			'<h3 class="jcuan_'+x+'">'+notice+'</h3>'+
			'<tr><th>订单号</th><th>订单id</th><th>商家id</th><th>商家名称</th><th>商家电话</th><th>收餐电话</th><th>订单总价</th><th>下单时间</th><th>超时时间</th></tr>';
};

jcuan.addDiv = function(common , hurry){
	var 
		body = document.getElementsByTagName('body')[0],
		//location = body.getElementsByTagName('div')[1],
		div1 = document.createElement('div'),
		div2 = document.createElement('div');
	div1.setAttribute("class", "jcuan_white_content");
	div1.id = 'jcuan_light';
	div1.innerHTML='<button onclick="document.getElementById(\'jcuan_light\').style.display=\'none\';document.getElementById(\'jcuan_fade\').style.display=\'none\'">Close</button>'+hurry + common;

	div2.setAttribute("class", "jcuan_black_overlay");
	div2.id = 'jcuan_fade';
	div2.innerHTML = '';
	body.appendChild(div1);
	body.appendChild(div2);

};


//弹框
jcuan.showDiv = function(){
	document.getElementById('jcuan_light').style.display='block';
	document.getElementById('jcuan_fade').style.display='block'	;
};


//获得超过时间两分钟的时间
jcuan.process = function(){
	var
		trList = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr'),
		regx = /<td.+?>[\s\S]*?([0-9]+)[\s\S]*?<td.+?>[\s\S]*?([0-9]+)[\s\S]*?>([0-9]+)<[\s\S]*?>([\S]*?)<[\s\S]*?>([0-9]{3}.+?)<[\s\S]*?<input type="button" data-infokeyid="([\s\S]*?)"[\s\S]*?>[\s\S]*?<td>[\s\S]*?>([0-9]{3}.+?)<[\s\S]*?<input type="button" data-infokeyid="([\s\S]*?)"[\s\S]*?>[\s\S]*?>([0-9]+.*?)<[\s\S]*?([0-9]{4}.+?:[0-9]{2})[^:]/,
		/*订单号：<td.+?>[\s\S]*?([0-9]+)[\s\S]*?
		订单id：<td.+?>[\s\S]*?([0-9]+)[\s\S]*?
		商家id：>([0-9]+)<[\s\S]*?
		商家名称：>([\S]*?)<[\s\S]*?
		商家电话：>([0-9]{3}.+?)<[\s\S]*?
		获取完整电话的key：<[\s\S]*?<input type="button" data-infokeyid="([\s\S]*?)"[\s\S]*?>
		送餐电话：
		获取送餐电话key：
		总价：
		日期字符串：
		*/
		limitTime = 1000*100,
		nowTime = new Date().getTime(),
		lateList = [],
		i = 0,  //用于循环
		j = 0,
		cha , //超时时间
		forSort , //sort使用的排序函数
		hurry , //超过3分钟列表html代码
		common , //普通超时列表html代码
		list = [],	//装regx提取内容的数组
		time ;  //用于时间格式化，现在的int时间


	for(i=1;i<trList.length-1;i++){
		list[i-1]=regx.exec(trList[i].innerHTML);
		if(list[i-1]){
			list[i-1].shift();	//去掉完整匹配的字符串
		}else{
			if(i===1){
				alert('啊偶~如果网页中商家号码不为空却弹出此框，这意味着匹配出错,请联系jcuan');
				return;
			}
		}
	};

	for(i=0;i<list.length;i++){
		time = Date.parse(list[i][9]);  //格式胡话时间为int（ms）
		cha = nowTime - time;
		if(cha > limitTime){
			list[i][10]= cha/1000;	//记录超时时间ms
			lateList.push(list[i]);
		}
	}

	forSort = function(x,y){	//设置排序函数
		if(x[10] > y[10]){
			return -1;
		}
		if(x[10] < y[10]){
			return 1;
		}
		return 0;
	};
	lateList.sort(forSort);

	if(lateList.length > 0){
		var threeSecond = 60*3,
			hurrySum =0,	//超时3min以上的订单个数
			isHurry =0;
		hurry = this.addTable('hurry');
		common = this.addTable('common');
		for(i=0;i<lateList.length; i++){
			isHurry = lateList[i][10] - threeSecond;
			lateList[i][10] = Math.floor(lateList[i][10]/60) + '分' + Math.floor(lateList[i][10]%60) + '秒';
			if(isHurry >=0){	//超时3min
				hurrySum++;
				hurry += '<tr>';
				for(j=0 ;j<11 ;j++){
					if( j === 4 ){
						hurry += '<td id="jcuan_shangjiaPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if( j=== 6){
						hurry += '<td id="jcuan_shoucanPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if(j=== 5){
						hurry += '<span id="jcuan_shangjiaKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else if(j===7){
						hurry += '<span id="jcuan_shoucanKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else{
						hurry += '<td>'+ lateList[i][j] + '</td>';		
					}
				}
				hurry += '</tr>';
			}else{
				common += '<tr>';
				for(j=0 ;j<11 ;j++){
					if( j === 4 ){
						common += '<td id="jcuan_shangjiaPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if( j=== 6){
						common += '<td id="jcuan_shoucanPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if(j=== 5){
						common += '<span id="jcuan_shangjiaKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else if(j===7){
						common += '<span id="jcuan_shoucanKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else{
						common += '<td>'+ lateList[i][j] + '</td>';		
					}
				}
				common += '</tr>';
			}
		}
	
	/*订单号：<td.+?>[\s\S]*?([0-9]+)[\s\S]*?
		订单id：<td.+?>[\s\S]*?([0-9]+)[\s\S]*?
		商家id：>([0-9]+)<[\s\S]*?
		商家名称：>([\S]*?)<[\s\S]*?
		商家电话：>([0-9]{3}.+?)<[\s\S]*?
		获取完整电话的key：<[\s\S]*?<input type="button" data-infokeyid="([\s\S]*?)"[\s\S]*?>
		送餐电话：
		获取送餐电话key：
		总价：
		日期字符串：
		*/
		
		if(hurrySum == 0){
			hurry += '<tr><td>无</td></tr></table>';
			common += '</table>';
		}else if(hurrySum === lateList.length ){
			common += '<tr><td>无</td></tr></table>';
			hurry += '</table>'
		}else{
			common += '</table>';
			hurry += '</table>';
		}

	}else{
		hurry = this.addTable('hurry');
		hurry += '<tr><td>无</td></tr></table>';
		common = this.addTable('common');
		common += '<tr><td>无</td></tr></table>'
	}

	this.addDiv(common, hurry);
	this.showDiv();
};

//刷新
jcuan.refresh = function(){
	window.location.reload();
};

//ajax
jcuan.loadXMLDoc = function (url,data,num,isShangjia)
{
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function() {
		        if (xmlhttp.readyState==4 && xmlhttp.status==200)
		        {
		            var result = JSON.parse(xmlhttp.responseText);
		            if(result.data){
		            	if(isShangjia){
		            		document.getElementById('jcuan_shangjiaPhone_'+num).innerHTML=result.data;
		            	}else{
		            		document.getElementById('jcuan_shoucanPhone_'+num).innerHTML=result.data;
		            	}
		            }else{
		            	if(isShangjia){
		            		document.getElementById('jcuan_shangjiaPhone_'+num).innerHTML='出错，联系jcuan';
		            	}else{
		            		document.getElementById('jcuan_shoucanPhone_'+num).innerHTML=result.data;
		            	}
		            }
		        }
		    };
    xmlhttp.open("POST",url,true);
    xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send('infoJson='+data);
};

jcuan.myAjaxFunction = function ()
{
    var x={},
    	i=0,
    	shangjiaKeyValue=null,
    	shoucanKeyValue=null,
    	shangjiaKey=null,
    	shoucanKey=null;

    shangjiaKey=document.getElementById('jcuan_shangjiaKey_'+i);

    while(shangjiaKey){
    	shoucanKey=document.getElementById('jcuan_shoucanKey_'+i);
    	shangjiaKeyValue=shangjiaKey.innerHTML;
    	shoucanKeyValue=shoucanKey.innerHTML;
    	if( !shangjiaKeyValue){	//key为空，匹配出错
    		document.getElementById('jcuan_shangjiaPhone_'+i).innerHTML='出错，联系jcuan';
    	}else if( !shoucanKeyValue){	//key为空，匹配出错
    		document.getElementById('jcuan_shoucanPhone_'+i).innerHTML='出错，联系jcuan';
    	}else{
    		x.infoId=shangjiaKeyValue;
		    x=JSON.stringify(x);
		    this.loadXMLDoc("http://kf.waimai.sankuai.com/infoaudit/api/look",x,i,true);
		    x={};
		    x.infoId=shoucanKeyValue;
		    x=JSON.stringify(x);
		    this.loadXMLDoc("http://kf.waimai.sankuai.com/infoaudit/api/look",x,i,false);
		    x={};
		}
		i++;	//获取下一个订单
		shangjiaKey=document.getElementById('jcuan_shangjiaKey_'+i);
	}
};

jcuan.addStyle();
setTimeout('jcuan.process()',4000);
setTimeout('jcuan.myAjaxFunction()',5000);
setTimeout('jcuan.refresh()',1000*20);