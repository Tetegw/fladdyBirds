/**
 * 作者：Tetegw
 * 描述：fiaddyBirds小游戏
 * 调用：
 * 		var game = Fly.Game({
	        wrapId: 'fladdybirds',			//必填 （默认'fladdybirds'）
	        speed : 15						//可选 （默认15）
	    });
   HTML要求：
   		<div id="fladdybirds"></div>	 	//宽800px，高600px
 */

// =======================全局对象=======================
(function(win){
	var Fly = {
		toRadian: function (angle) {                                 //角度转弧度
	        return angle / 180 * Math.PI;
	    },
	    toAngle: function (radian) {                                 //弧度转角度
	        return radian / Math.PI * 180;
	    },
	    															 //封装加载图片的函数
	    imgload: function (imgarr, callback) {
	        var imgObj = {};
	        var loaded = 0;
	        imgarr.forEach(function(value) {                         //遍历加载完成
	            var img = new Image();
	            img.src = 'images/' + value + '.png';
	            img.addEventListener('load', function() {            //监听加载事件
	                loaded++;										 //loaded++
	                imgObj[value] = img;                             //储存img对象
	                if (loaded >= imgarr.length) {					 //判断loaded是否达到总长度
	                    callback(imgObj);							 //回调函数调用
	                };
	            });
	        });
	    },
	};
	win.Fly = Fly;													 //Fly 暴露给win,唯一的全局变量
})(window);

// =======================game对象=======================
(function(Fly,document){
	function Game(options) {
	    this.defaultData = {
	    	wrapId: 'fladdybirds',
	    	speed : 15
	    };
	    this.init(options);
	}

	Game.prototype = {
	    constructor: Game,
	    init: function(options) {									 //初始化Game
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        var imgList = ['birds', 'land', 'pipe1', 'pipe2', 'sky'];

	        this.createEle();										 //创建元素函数
	        this.bind();											 //绑定事件
	        this.startgame(imgList,-(_default.speed/100));			 //开始游戏，传入数据 和速度
	    },
	    createEle:function(){
	    	this.wrapper = document.getElementById(this.defaultData.wrapId);
	    	this.cv = document.createElement('canvas');
	    	this.bg = document.createElement('div');
	    	this.info = document.createElement('div');
	    	this.numinfo = document.createElement('span');
	    	this.second = document.createElement('span');
	    	this.second.innerHTML = ' 秒';
	    	this.numinfowrap = document.createElement('p');
	    	this.numinfowrap.innerHTML = '总共坚持了 ';
	    	this.restart = document.createElement('button');
			this.restart.innerHTML = '重新开始';

	    	this.numinfowrap.appendChild(this.numinfo);
	    	this.numinfowrap.appendChild(this.second);
	    	this.info.appendChild(this.numinfowrap);
	    	this.info.appendChild(this.restart);
	    	this.bg.appendChild(this.info);
	    	this.wrapper.appendChild(this.cv);
	    	this.wrapper.appendChild(this.bg);

		    this.ctx = this.cv.getContext("2d");
		    this.cv.height = 600;
		    this.cv.width = 800;

		    this.wrapper.style.position = 'relative';
		    this.bg.style.position = 'absolute';
	    	this.bg.style.top = 0;
	    	this.bg.style.left = 0;
	    	this.bg.style.width = this.cv.width + 'px';
	    	this.bg.style.height = this.cv.height + 'px';
	    	this.bg.style.display = 'none';
	    	this.bg.style.backgroundColor = 'rgba(0,0,0,.3)';
	    	this.info.style.position = 'absolute';
	    	this.info.style.top = '180px';
	    	this.info.style.left = '250px';
	    	this.info.style.width = '300px';
	    	this.info.style.height = '140px';
	    	this.info.style.textAlign = 'center';
	    	this.info.style.backgroundColor = 'rgba(255,255,255,.3)';
	    	this.numinfowrap.style.font ="400 20px/30px 'microsoft yahei'";
	    	this.restart.style.width = '140px';
	    	this.restart.style.height = '30px';
	    	this.numinfo.style.color = 'red';									   //根据wrapID创建内部元素，设置样式
	    },
	    startgame:function(imgList,speed){							 //开始游戏，循环创建对象
	    	var _this = this;
			Fly.imgload(imgList, function(imgObj) {					 //加载完，执行创建游戏中所有对象
				_this.imgObj = imgObj;
				_this.speed = speed;
				_this.lastTime = +new Date();
				_this.gameTime = 0;
				var objList = [];									 //创建新对象，存储所有对象
				_this.isStart = true;
																	 //创建小鸟对象
				_this.bird = new Fly.Bird({
					ctx : _this.ctx,
					img: imgObj['birds']
				});
																	 //创建两个天空对象
				for (var i = 0; i < 2; i++) {
					var sky = new Fly.Sky({
					    ctx : _this.ctx,
					    img : imgObj['sky'],
					    x : imgObj['sky'].width * i,				 //X轴坐标
					    y : 0,
					    speed : _this.speed
					});
					objList.push(sky);
				};
																	 //创建6个（包括上下）管道
				for (var i = 0; i < 6; i++) {
					var pipe = new Fly.Pipe({
					    cv : _this.cv,
					    ctx : _this.ctx,
					    pipeTop : imgObj['pipe2'],
					    pipeBot : imgObj['pipe1'],
					    x : imgObj['pipe2'].width * i * 3 + 300,   	 //初始距离 + 每个之间距离
					    speed: _this.speed
					});
					objList.push(pipe);
				};

				for (var i = 0; i < 4; i++) {						 //创建四个陆地对象
					var land = new Fly.Land({
					    cv : _this.cv,
					    ctx : _this.ctx,
					    img: imgObj['land'],
					    x:imgObj['land'].width * i,					 //陆地的X轴
					    y:0,
					    speed: _this.speed
					});
					objList.push(land);								 //创建后的对象，放在objList中
				};
				_this.draw( objList );								 //调用draw事件，把objList传进去
			})
	    },
	    draw:function( objList ){									 //总渲染，调用Game渲染方法
	    	var _this = this;
			(function render() {
				var nowTime = +new Date(),							 //计算每次时间差，覆盖上一次时间
				    delta = nowTime - _this.lastTime;				 //计算时间差 delta
				_this.lastTime = nowTime;							 //替代lastTime的值
				_this.gameTime+=delta;								 //计算总时间，用于展示

				_this.ctx.save();									 //保存状态，开始路径，清除画布
				_this.ctx.beginPath();
				_this.ctx.clearRect(0, 0, _this.cv.width, _this.cv.height);

				for (var i = 0; i < objList.length; i++) {			 //渲染其他所有对象
				    objList[i].draw( delta )
				};
																	 //渲染加上时间，所有提示
				_this.ctx.font = '18px 微软雅黑';
				_this.ctx.fillText('已坚持了 ', 630,30);
				_this.ctx.save();
				_this.ctx.fillStyle = 'red';
				_this.ctx.fillText(_this.gameTime/1000, 710,30,50);
				_this.ctx.restore();
				_this.ctx.fillText(' 秒', 760,30);
				_this.ctx.fillText('键盘 ↑ 键控制跳跃，Enter键 控制重新开始', 430,560);

				_this.bird.draw( delta );							 //渲染调用 小鸟对象渲染 的方法

																	 //碰撞判断
				if (_this.bird.lastY <= 10 || (_this.bird.lastY >=_this.cv.height - _this.imgObj['land'].height -15) || _this.ctx.isPointInPath(_this.bird.x, _this.bird.lastY) ) {
						_this.stopganme();
				};
																	 //必须绘制完才能恢复，否则改变的不会被绘制
				_this.ctx.restore();								 //每次结束，恢复上下文状态

				if (_this.isStart) {								 //动画循环
				    window.requestAnimationFrame(render);
				};
			})();
	    },
	    bind:function(){											 //绑定鼠标和键盘事件
	    	var _this = this;
	    															 //点击cv画布，让小鸟有个反向的速度
	        this.cv.addEventListener('click',function(event){
	            _this.bird.changeAngle( -0.3 );						 //调用小鸟对象 改变角度的方法
	        });
	        this.restart.addEventListener('click',function(){		 //刷新画布
	            window.location.reload();
	        });
	        document.addEventListener('keydown',function(e){		 //判断键位keyCode
	            if (e.keyCode === 38) {
	                _this.bird.changeAngle( -0.3 );
	            }else if(e.keyCode === 13){
	                window.location.reload();
	            };
	        });
	    },
	    stopganme:function(){										 //停止游戏isStart = false;
	    	this.isStart = false;
            this.numinfo.innerHTML = this.gameTime/1000;
            this.bg.style.display = 'block';
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	var instance = null;										 	 //单例模式
	var createGame = function(options){
		if (instance === null) {
			instance  = new Game( options );
		};
		return instance;
	}

	Fly.Game = createGame;										     //Game 暴露 给全局变量Fly.Game
})(Fly,document);

// =======================小鸟对象=======================
(function(Fly){
	function Bird(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Bird.prototype = {
	    constructor: Bird,
	    init: function(options) {									 //初始化小鸟对象
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        this.ctx = _default.ctx;			 					 //获取画板上下文
	        this.img = _default.img;     		 					 //获取到小鸟对象
            this.imgW = this.img.width / 3;      					 //计算一个精灵图宽高
            this.imgH = this.img.height;

            this.numX = 0;                       					 //选择精灵图的索引
            this.V0= 0;                          					 //初始速度
            this.a = 0.0005;                     					 //加速度
            this.lastY = 100;                    					 //小鸟的Y坐标，会不断的变化
            this.x = 100;
            this.S = 0;                          					 //小鸟每次下落的距离
            this.maxAngle = 45,                  					 //小鸟旋转最大角度
            this.maxSpeed = 0.3;                 					 //小鸟旋转最大角度时 对应的最大速度
            this.curAngle = 0;                   					 //当前旋转角度
	    },
	    draw : function(delta){
	    															 //计算小鸟下落的速度
	    	//Vt = V0 + a * t;  S = Vt * t + 1/2 * a * t * t;
            this.V0 = this.V0 + this.a * delta;
            this.S = this.V0 * delta + 0.5 * this.a * Math.pow(delta , 2) ;
            this.lastY += this.S;
            														 //计算角度
            //curAngle = speed / maxSpeed * maxAngle;
            this.curAngle = this.V0 / this.maxSpeed * this.maxAngle;
            if (this.V0 >= this.maxSpeed) {
                this.curAngle = this.maxAngle;
            }else if(this.V0 <= -this.maxSpeed){
                this.curAngle = -this.maxAngle;
            }
            														 //移动画布到小鸟中心，旋转画布
            this.ctx.translate(this.x, this.lastY);
            this.ctx.rotate(Fly.toRadian(this.curAngle));

            														 //绘制小鸟
            this.ctx.drawImage(this.img, this.imgW * this.numX++, 0, this.imgW, this.imgH, -this.imgW/2, -this.imgH/2, this.imgW, this.imgH);
            this.numX %= 3;
	    },
	    changeAngle:function( speed ){								 //根据速度正负，改变，点击事件时调用
	    	this.V0 = speed;
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Bird = Bird;												 //将Bird暴露给全局Fly
})(Fly);


// =======================天空对象=======================
(function(Fly){
	function Sky(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Sky.prototype = {
	    constructor: Sky,
	    init: function(options) {
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        this.ctx = _default.ctx;			 					 //获取画板上下文
	        this.img = _default.img;								 //获取天空对象
            this.imgW = this.img.width;      	 					 //计算一个精灵图宽高
            this.imgH = this.img.height;
            this.x = _default.x || 0;								 //参数处理，如果不传，默认为0（第一张背景）
            this.y = _default.y || 0;
            this.speed = _default.speed;							 //设定速度，和陆地管道相同;
	    },
	    draw: function( delta ){									 //通过delta来渲染天空
	    	this.ctx.drawImage(this.img, this.x, this.y, this.imgW, this.imgH);
	    	this.x += delta * this.speed;
	    	if (this.x  <= -this.imgW) {							 //如果完全移出画布后，直接跳到最后，继续运动
	    		this.x += this.imgW * 2;
	    	};
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Sky = Sky;													 //将Sky 暴露给 Fly对象
})(Fly);


// =======================陆地对象=======================
(function(Fly){
	function Land(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Land.prototype = {
	    constructor: Land,
	    init: function(options) {
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        this.cv = _default.cv;
	        this.ctx = _default.ctx;			 					 //获取画板上下文
	        this.img = _default.img;								 //获取陆地对象
            this.imgW = this.img.width;      	 					 //计算一个精灵图宽高
            this.imgH = this.img.height;
            this.x = _default.x || 0;								 //初始化坐标
            this.y = _default.y || this.cv.height - this.img.height; //陆地对象Y轴在最下面
            this.speed = _default.speed;							 //设定速度
	    },
	    draw: function( delta ){
	    	this.ctx.drawImage(this.img, this.x, this.y, this.imgW, this.imgH);
	    	this.x += delta * this.speed;							 //x轴坐标不停增加
	    	if (this.x  <= -this.imgW) {
	    		this.x += this.imgW * 4;
	    	};
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};
	Fly.Land = Land;												 //将陆地对象暴露给Fly对象
})(Fly);


// =======================管道对象=======================
(function(Fly){
	function Pipe(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Pipe.prototype = {
	    constructor: Pipe,
	    init: function(options) {
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        this.cv = _default.cv;
	        this.ctx = _default.ctx;			 					 //获取画板上下文
	        this.pipeTop = _default.pipeTop;						 //上部管道对象
	        this.pipeBot = _default.pipeBot;						 //下部管道对象
            this.imgW = this.pipeTop.width;
            this.imgH = this.pipeTop.height;
            this.speed = _default.speed;
            this.x = _default.x;									 //再game创建时 就计算好

            this.pipeTopy = 0;										 //先设定为0，creatY()会计算赋值
            this.pipeBoty = 0;
            this.hardlevel = 130;									 //难度等级，就是两个管道间距离

            this.creatY();
	    },
	    creatY: function(){
	    	var piperandom  = Math.random()*200 + 50;				 //随机生成一个长度，最小50 最大250
	    	this.pipeTopy = piperandom - this.imgH;
	    	this.pipeBoty = piperandom + this.hardlevel;
	    },
	    draw: function( delta ){
	    	this.ctx.drawImage(this.pipeTop, this.x, this.pipeTopy, this.imgW, this.imgH);
	    	this.ctx.drawImage(this.pipeBot, this.x, this.pipeBoty, this.imgW, this.imgH);
	    															 //创建路径，用于计算碰撞，扩展10像素
	    	this.ctx.rect(this.x-5, this.pipeTopy-5, this.imgW+10, this.imgH+10);
	    	this.ctx.rect(this.x-5, this.pipeBoty-5, this.imgW+10, this.imgH+10);
	    	// this.ctx.stroke();
	    	this.x += delta * this.speed;
	    	if (this.x  <= -this.imgW) {
	    		this.x += this.imgW * 6 * 3;						 //超出后，移动到最后面
	    	};
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Pipe = Pipe;												 //将Pipe暴露给Fly
})(Fly);





