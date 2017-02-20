// =======================全局对象=======================
(function(win){
	var Fly = {
		toRadian: function (angle) {                                   //角度转弧度
	        return angle / 180 * Math.PI;
	    },
	    toAngle: function (radian) {                                   //弧度转角度
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
	                loaded++;
	                imgObj[value] = img;                             //储存img对象
	                if (loaded >= imgarr.length) {
	                    callback(imgObj);
	                };
	            });
	        });
	    },
	};
	win.Fly = Fly;
})(window);

// =======================game对象=======================
(function(Fly){
	function Game(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Game.prototype = {
	    constructor: Game,
	    init: function(options) {
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);
	        this.cheat = true;

	        var imgList = ['birds', 'land', 'pipe1', 'pipe2', 'sky'];

	        this.createEle();
	        this.bind();
	        this.startgame(imgList);
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
	    	this.numinfo.style.color = 'red';
	    },
	    startgame:function(imgList){
	    	var _this = this;
			Fly.imgload(imgList, function(imgObj) {
				_this.imgObj = imgObj;
				_this.lastTime = +new Date();
				_this.gameTime = 0;
				var objList = [];
				_this.isStart = true;
				//创建小鸟对象
				_this.bird = new Fly.Bird({
					ctx : _this.ctx,
					img: imgObj['birds']
				});
				// console.log(_this.bird)

				//创建天空
				for (var i = 0; i < 2; i++) {
					var sky = new Fly.Sky({
					    ctx : _this.ctx,
					    img : imgObj['sky'],
					    x : imgObj['sky'].width * i,
					    y : 0
					});
					objList.push(sky);
				};

				//创建管道
				for (var i = 0; i < 6; i++) {
					var pipe = new Fly.Pipe({
					    cv : _this.cv,
					    ctx : _this.ctx,
					    pipeTop : imgObj['pipe2'],
					    pipeBot : imgObj['pipe1'],
					    x : imgObj['pipe2'].width * i * 3 + 300
					});
					objList.push(pipe);
				};

				//创建陆地
				for (var i = 0; i < 4; i++) {
					var land = new Fly.Land({
					    cv : _this.cv,
					    ctx : _this.ctx,
					    img: imgObj['land'],
					    x:imgObj['land'].width * i,
					    y:0
					});
					objList.push(land);
				};
				_this.draw( objList );
			})
	    },
	    draw:function( objList ){
	    	var _this = this;
			(function render() {
				//计算每次时间差，覆盖上一次时间
				var nowTime = +new Date(),
				    delta = nowTime - _this.lastTime;
				_this.lastTime = nowTime;
				_this.gameTime+=delta;

				//清除画布
				_this.ctx.save();
				_this.ctx.beginPath();
				_this.ctx.clearRect(0, 0, _this.cv.width, _this.cv.height);

				//渲染其他所有对象
				for (var i = 0; i < objList.length; i++) {
				    objList[i].draw( delta )
				};
				//加上时间
				_this.ctx.font = '18px 微软雅黑';
				_this.ctx.fillText('已坚持了 ', 630,30);
				_this.ctx.save();
				_this.ctx.fillStyle = 'red';
				_this.ctx.fillText(_this.gameTime/1000, 710,30,50);
				_this.ctx.restore();
				_this.ctx.fillText(' 秒', 760,30);
				_this.ctx.fillText('键盘 ↑ 键控制跳跃，Enter键 控制重新开始', 430,560);


				//渲染小鸟
				_this.bird.draw( delta );

				//碰撞判断
				if (_this.bird.lastY <= 10 || (_this.bird.lastY >=_this.cv.height - _this.imgObj['land'].height -15) || _this.ctx.isPointInPath(_this.bird.x, _this.bird.lastY) ) {
					if (_this.cheat) {
						_this.stopganme();
					};
				};

				//必须绘制完才能恢复，否则改变的不会被绘制
				_this.ctx.restore();

				//动画循环
				if (_this.isStart) {
				    window.requestAnimationFrame(render);
				};
			})();
	    },
	    bind:function(){
	    	var _this = this;
	    	//点击cv画布，让小鸟有个反向的速度
	        this.cv.addEventListener('click',function(event){
	            _this.bird.changeAngle( -0.3 );
	        });
	        this.restart.addEventListener('click',function(){
	            window.location.reload();
	        });
	        document.addEventListener('keydown',function(e){
	            if (e.keyCode === 38) {
	                _this.bird.changeAngle( -0.3 );
	            }else if(e.keyCode === 13){
	                window.location.reload();
	            }else if(e.keyCode === 113){
	            	_this.cheat = false;
	            }else if(e.keyCode === 115){
	            	_this.cheat = true;
	            }
	        });

	    },
	    stopganme:function(){
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

	Fly.Game = Game;
})(Fly);

// =======================小鸟对象=======================
(function(Fly){
	function Bird(options) {
	    this.defaultData = {};
	    this.init(options);
	}

	Bird.prototype = {
	    constructor: Bird,
	    init: function(options) {
	        var _this = this;
	        var _default = this.defaultData;
	        this.extend(_default, options);

	        this.ctx = _default.ctx;			 //获取画板上下文
	        this.img = _default.img;     		 //获取到小鸟对象
            this.imgW = this.img.width / 3;      //计算一个精灵图宽高
            this.imgH = this.img.height;

            this.numX = 0;                       //选择精灵图的索引
            this.V0= 0;                          //初始速度
            this.a = 0.0005;                     //加速度
            this.lastY = 100;                    //小鸟的Y坐标，会不断的变化
            this.x = 100;
            this.S = 0;                          //小鸟每次下落的距离
            this.maxAngle = 45,                  //小鸟旋转最大角度
            this.maxSpeed = 0.3;                 //小鸟旋转最大角度时 对应的最大速度
            this.curAngle = 0;                   //当前旋转角度
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

            //旋转画布
            this.ctx.translate(this.x, this.lastY);
            this.ctx.rotate(Fly.toRadian(this.curAngle));

            //绘制小鸟
            this.ctx.drawImage(this.img, this.imgW * this.numX++, 0, this.imgW, this.imgH, -this.imgW/2, -this.imgH/2, this.imgW, this.imgH);
            this.numX %= 3;
	    },
	    changeAngle:function( speed ){
	    	this.V0 = speed;
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Bird = Bird;
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

	        this.ctx = _default.ctx;			 //获取画板上下文
	        this.img = _default.img;
            this.imgW = this.img.width;      	 //计算一个精灵图宽高
            this.imgH = this.img.height;
            this.x = _default.x || 0;
            this.y = _default.y || 0;

            this.speed = -0.15;
	    },
	    draw: function( delta ){

	    	this.ctx.drawImage(this.img, this.x, this.y, this.imgW, this.imgH);
	    	this.x += delta * this.speed;
	    	if (this.x  <= -this.imgW) {
	    		this.x += this.imgW * 2;
	    	};
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Sky = Sky;
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
	        this.ctx = _default.ctx;			 //获取画板上下文
	        this.img = _default.img;
            this.imgW = this.img.width;      	 //计算一个精灵图宽高
            this.imgH = this.img.height;
            this.x = _default.x || 0;
            this.y = _default.y || this.cv.height - this.img.height;

            this.speed = -0.15;
	    },
	    draw: function( delta ){

	    	this.ctx.drawImage(this.img, this.x, this.y, this.imgW, this.imgH);
	    	this.x += delta * this.speed;
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

	Fly.Land = Land;
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
	        this.ctx = _default.ctx;			 //获取画板上下文
	        this.pipeTop = _default.pipeTop;
	        this.pipeBot = _default.pipeBot;
            this.imgW = this.pipeTop.width;
            this.imgH = this.pipeTop.height;

            this.x = _default.x;
            this.pipeTopy = 0;
            this.pipeBoty = 0;
            this.speed = -0.15;
            this.hardlevel = 130;

            this.creatY();
	    },
	    creatY: function(){
	    	var piperandom  = Math.random()*200 + 50;
	    	this.pipeTopy = piperandom - this.imgH;
	    	this.pipeBoty = piperandom + this.hardlevel;
	    },
	    draw: function( delta ){
	    	this.ctx.drawImage(this.pipeTop, this.x, this.pipeTopy, this.imgW, this.imgH);
	    	this.ctx.drawImage(this.pipeBot, this.x, this.pipeBoty, this.imgW, this.imgH);
	    	this.ctx.rect(this.x-5, this.pipeTopy-5, this.imgW+10, this.imgH+10);
	    	this.ctx.rect(this.x-5, this.pipeBoty-5, this.imgW+10, this.imgH+10);
	    	// this.ctx.stroke();
	    	this.x += delta * this.speed;
	    	if (this.x  <= -this.imgW) {
	    		this.x += this.imgW * 6 * 3;
	    	};
	    },
	    extend: function(oldObj, newObj) {
	        for (var k in newObj) {
	            oldObj[k] = newObj[k];
	        }
	    },
	};

	Fly.Pipe = Pipe;
})(Fly);





