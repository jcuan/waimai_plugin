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

jcuan.addAudio = function (){
	var body = document.getElementsByTagName('body')[0],
		audio;
	function create(id,url){
		audio = document.createElement('audio');
		audio.id=id;
		audio.src=chrome.extension.getURL(url);
		audio.display="none";
		body.appendChild(audio);
	};
	create('jcuan_audio_yiban',"yiban.wav");
	create('jcuan_audio_yanzhong',"yanzhong.mp3");
	create('jcuan_audio_yichang',"yichang.wav");
	create('jcuan_audio_chengxuyichang',"chengxuyichang.wav");
;}

//增加table标签前部
jcuan.addTable = function(x){
	var notice;
	if(x==='hurry_level1'){
		notice = '超时80-120S';
		x='hurry';	//使用的class名
	}else if(x==='hurry_level2'){
		notice = '超时120S';
		x = 'hurry'; //使用的class名
	}else{
		notice = '超时30-80S';
	}
	return 	'<table class="jcuan_table">'+
			'<h3 class="jcuan_'+x+'">'+notice+'</h3>'+
			'<tr><th>订单号</th><th>订单id</th><th>商家id</th><th>商家名称</th><th>商家电话</th><th>收餐电话</th><th>订单总价</th><th>下单时间</th><th>超时时间</th></tr>';
};

jcuan.addDiv = function(common , hurry_level1, hurry_level2){
	var 
		body = document.getElementsByTagName('body')[0],
		//location = body.getElementsByTagName('div')[1],
		div1 = document.createElement('div'),
		div2 = document.createElement('div');
	div1.setAttribute("class", "jcuan_white_content");
	div1.id = 'jcuan_light';
	div1.innerHTML='<button onclick="document.getElementById(\'jcuan_light\').style.display=\'none\';document.getElementById(\'jcuan_fade\').style.display=\'none\'">Close</button>点击电话号码获得完整的号码'+hurry_level2 + hurry_level1 + common;

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


jcuan.showError = function(){
	this.addDiv('<h3>ERROR，自动刷新ing:(</h3>','','<br/>');
	this.showDiv();
	var localInfo = localStorage.getItem('jcuan'),
		localTime = localStorage.getItem('jcuan_time');
	localInfo  = Number(localInfo);	//记录错误次数
	localTime = Number(localTime);	//开始记录的时间
	if(localInfo === 0){
		localStorage.setItem('jcuan',1);
		localStorage.setItem('jcuan_time',Date.parse(new Date())/1000);
		localInfo=1;
	}else{
		localInfo++;
		localStorage.setItem('jcuan',localInfo);
	}
	//30min之内正常情况下刷新60次，一直异常情况下大概刷新450次,如果30min内记录错误次数达到100次，那么将发出声音;
	if(localInfo>100){
		if(Date.parse(new Date())/1000 - localTime < 1800){
			this.playAudio('chengxuyichang');
		}
		localStorage.removeItem('jcuan');
		localStorage.removeItem('jcuan_time');
	}

};

jcuan.playAudio = function(audioType){
	var audio = document.getElementById('jcuan_audio_'+audioType);
	audio.play();
};
	
//为点击电话号码绑定事件
jcuan.addClickEvent = function(){
	var oldOncick = document.onclick;
	var that=this;
	document.onclick=function(event){
		var eleId = event.target.id;
		if(eleId.indexOf('jcuan_shoucanPhone_')===-1 && eleId.indexOf('jcuan_shangjiaPhone_')===-1){
			if(typeof oldOncick == 'function'){
				oldOncick(event);
			}
		}else{
			eleId= eleId.replace('jcuan_shoucanPhone_','');
			eleId= eleId.replace('jcuan_shangjiaPhone_','');
			that.getPhone(eleId);
		}
	};
};

//刷新
jcuan.refresh = function(){
	window.location.reload();
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
		limitTime = 30,	//超过30s的才会显示，也就是common表里的
		nowTime = Date.parse(new Date())/1000,
		lateList = [],
		i = 0,  //用于循环
		j = 0,
		cha , //超时时间
		forSort , //sort使用的排序函数
		hurry_level1 , //超过180-120s以上的列表html代码
		hurry_level2,	//超时120+
		common , //普通超时列表html代码
		list = [],	//装regx提取内容的数组
		time ;  //用于时间格式化，现在的int时间

	if(trList.length===0){	//网页未正常载入，播放异常语音并退出
		this.showError();
		setTimeout(this.refresh,1000*4);
		return;
	}

	for(i=1;i<trList.length-1;i++){
		list[i-1]=regx.exec(trList[i].innerHTML);
		if(list[i-1]){
			list[i-1].shift();	//去掉完整匹配的字符串
		}else{
			if(i===1){
				this.showError();
				setTimeout(this.refresh,1000*4);
				return;
			}
		}
	};

	for(i=0;i<list.length;i++){
		time = Date.parse(list[i][9])/1000;  //格式化时间为int（ms）
		cha = nowTime - time;
		if(cha > limitTime){
			list[i][10]= cha;	//记录超时s
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
	lateList.sort(forSort);	//按照超时时间排序

	if(lateList.length > 0){
		var level1_time = 80,
			level2_time = 120,
			hurry_level1_sum =0,	//超时80s-120s的订单个数
			hurry_level2_sum =0,	//超时120个数
			common_sum=0,	//common个数
			chaoshiTime =0;	//超时时间
		hurry_level1 = this.addTable('hurry_level1');
		hurry_level2 = this.addTable('hurry_level2');
		common = this.addTable('common');

		//创建每个订单对应的表格
        function createLateTr( i, lateList ){   //生成超时table里边的tr行 
                var j, 
                    who='';     //返回的内容 

				who +='<tr>';
				for(j=0 ;j<11 ;j++){
					if( j === 4 ){
						who += '<td id="jcuan_shangjiaPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if( j=== 6){
						who += '<td id="jcuan_shoucanPhone_'+i+'">'+ lateList[i][j] + '</td>';
					}else if(j=== 5){
						who += '<span id="jcuan_shangjiaKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else if(j===7){
						who += '<span id="jcuan_shoucanKey_'+i+'" hidden="hidden">'+ lateList[i][j] + '</span>';
					}else{
						who += '<td>'+ lateList[i][j] + '</td>';		
					}
				}
				who +='</tr>';
			    return who;
        }

		for(i=0;i<lateList.length; i++){
			chaoshiTime = lateList[i][10];
			lateList[i][10] = Math.floor(lateList[i][10]/60) + '分' + lateList[i][10]%60 + '秒';	//转换成友好时间

			if(chaoshiTime > level2_time){	//超时3min
				hurry_level2_sum++;
                hurry_level2 += createLateTr(i,lateList);
			}else if(chaoshiTime > level1_time){
				hurry_level1_sum++;
                hurry_level1 += createLateTr(i,lateList);
			}else{
				common_sum++;
				common += createLateTr(i,lateList);
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
		
		if(hurry_level2_sum === 0){
			hurry_level2 += '<tr><td>无</td></tr>';
		}else{
			this.playAudio('yanzhong');	//播放严重语音提示
		}
		if(hurry_level1_sum ===  0){
			hurry_level1 += '<tr><td>无</td></tr>';
		}else if(hurry_level2_sum ===0){
			this.playAudio('yiban');	//语音一般提示
		}
		if(common_sum ===0){
			common += '<tr><td>无</td></tr>';
		}
		hurry_level1 +='</table>';
		hurry_level2 +='</table>';
		common +='</table>';


	}else{
		hurry_level2 = this.addTable('hurry_level2');
		hurry_level2 += '<tr><td>无</td></tr></table>';
		hurry_level1 = this.addTable('hurry_level1');
		hurry_level1 += '<tr><td>无</td></tr></table>';
		common = this.addTable('common');
		common += '<tr><td>无</td></tr></table>'
	}

	this.addDiv(common, hurry_level1, hurry_level2);
	this.showDiv();
};




//获得电话号码,num是tr的id后边的数字
jcuan.getPhone = function(num)
{
	jcuan.myAjaxFunction(num);

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
		            		document.getElementById('jcuan_shoucanPhone_'+num).innerHTML='出错，联系jcuan';
		            	}
		            }
		        }
		    };
    xmlhttp.open("POST",url,true);
    xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send('infoJson='+data);
};

//获取电话号码
jcuan.myAjaxFunction = function (i)
{
    var x={},
    	shangjiaKeyValue=null,
    	shoucanKeyValue=null,
    	shangjiaKey=null,
    	shoucanKey=null;

//1.2更新 号码改为点击后再获取
		shangjiaKey=document.getElementById('jcuan_shangjiaKey_'+i);
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

};


//增加载入的事件
/*jcuan.addLoadEvent = function (func){
	var oldonload=window.onload;
	if(typeof window.onload!="function"){
		window.onload=func;
	}else{
		window.onload=function(){
			oldonload();
			func();
		}
	};
};*/

jcuan.addStyle();
jcuan.addAudio();
//jcuan.showError();
//jcuan.playAudio("yichang");
//jcuan.playAudio('chengxuyichang');
setTimeout('jcuan.process()',1000*3);
jcuan.addClickEvent();

setTimeout('jcuan.refresh()',1000*30);
