const {spawn} = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
const WebSocket = require("ws")

is_server()
function is_server() {
	console.clear();
	rl.question("输入程序状态 (0 发送端/1 接收端): ",function(answer){
	    if (answer == "0") {
	    	set_point()
	    }else if (answer == "1"){
	    	cliten()
	    }else{
	    	console.log("值无效");
	    	setTimeout(function () {
	    		is_server()
	    	},1500)
	    }
	});
}

function set_point() {
	rl.question("指定使用端口: ",function(port){
	    server(port)
	})
}

//控制端
function server(port) {
	var content_num = 0, mouse_data = ""
	const wss = new WebSocket.Server({ port: port });
	wss.on('connection', function connection(ws) {
		readline.clearLine(process.stdout, 2);
		readline.cursorTo(process.stdout, 0,2)
		content_num++
		process.stdout.write(`连接数: ${content_num}`,'utf-8');
		let pong = null
		pong = setTimeout(function () {
			readline.clearLine(process.stdout, 2);
			readline.cursorTo(process.stdout, 0,2)
			content_num--
			process.stdout.write(`连接数: ${content_num}`,'utf-8');
			ws.terminate()
		},1000)
		ws.on("message",function (msg) {
			clearTimeout(pong)
			pong = setTimeout(function () {
				readline.clearLine(process.stdout, 2);
				readline.cursorTo(process.stdout, 0,2)
				content_num--
				process.stdout.write(`连接数: ${content_num}`,'utf-8');
				ws.terminate()
			},1000)
		})
		setInterval(function () {
			ws.send(mouse_data);
		},30)
	});
	console.clear();
	console.log("控制端已启动");
	console.log("连接地址为: "+getIPAddress()+":"+port);
	console.log(`连接数: ${content_num}`);
	// 监听鼠标位置
	setInterval(function () {
		const get_mouse_point = spawn('./get_mouse_point.exe', ['|']);
		get_mouse_point.stdout.on('data', (data) => {
			readline.clearLine(process.stdout, 4);
			readline.cursorTo(process.stdout, 0,4)
			process.stdout.write(`鼠标状态: ${data}          \n`);
			mouse_data = data
		});
	},30)
}

function cliten() {
	console.clear();
	rl.question("控制端地址:",function(answer){
		content_ws(answer)
	});
}

// 被控制端
function content_ws(ip) {
	console.log("尝试连接中...");
	var ips = ip
	var btn_d = {
		left: true,
		middle: true,
		right: true
	}
	const ws = new WebSocket(`ws://${ip}`);
	ws.on('open', function () {
		console.log("连接成功");
	});
	ws.on('message', function (data) {
		let datas = data.toString()
		readline.clearLine(process.stdout, 4);
		readline.cursorTo(process.stdout, 0,4)
		process.stdout.write(`鼠标已被控制: ${datas}          \n`);
		let arrs = datas.split(",")
		if (arrs[0] == 1 && btn_d.left === true) {
			console.log("左键按下");
			btn_d.left = false
			spawn('./nircmd.exe', ["sendmouse","left","down"]);
		}else if (arrs[0] == 0 && btn_d.left === false) {
			console.log("左键抬起");
			btn_d.left = true
			spawn('./nircmd.exe', ["sendmouse","left","up"]);
		}
		if (arrs[1] == 1 && btn_d.middle === true) {
			console.log("中键按下");
			btn_d.middle = false
			spawn('./nircmd.exe', ["sendmouse","middle","down"]);
		}else if (arrs[1] == 0 && btn_d.middle === false) {
			console.log("中键抬起");
			btn_d.middle = true
			spawn('./nircmd.exe', ["sendmouse","middle","up"]);
		}
		if (arrs[2] == 1 && btn_d.right === true) {
			console.log("右键按下");
			btn_d.right = false
			spawn('./nircmd.exe', ["sendmouse","right","down"]);
		}else if (arrs[2] == 0 && btn_d.right === false) {
			console.log("右键抬起");
			btn_d.right = true
			spawn('./nircmd.exe', ["sendmouse","right","up"]);
		}
		spawn('./nircmd.exe', ["setcursor",arrs[3],arrs[4]]);
	});
	ws.on('close', function () {
		console.log('本机已断开连接,请重启进程');
		spawn('./nircmd.exe', ["sendmouse","left","up"]);
		spawn('./nircmd.exe', ["sendmouse","middle","up"]);
		spawn('./nircmd.exe', ["sendmouse","right","up"]);
	});
	// 心跳上报
	setInterval(function () {
		ws.send("pong")
	},500)
}

// 获取ip地址
function getIPAddress(){
  var interfaces = require('os').networkInterfaces();
  for(var devName in interfaces){
      var iface = interfaces[devName];
      for(var i=0;i<iface.length;i++){
          var alias = iface[i];
          if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
              return alias.address;
          }
      }
  }
}