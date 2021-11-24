'use strict';
const readline = require('readline');
const fs = require("fs");
let targetFile = './ProtoFile/message.proto';  //要转换的文件
let path = "./json/success.proto";
let timer = null;
const r1 = readline.createInterface({
    input: fs.createReadStream(targetFile)
})
let fWrite = fs.createWriteStream(path);
let count = 1;
let test0 = /[*\t\n\r]/g;
let test1 = /[//]/g;
let test2 = /[\u4e00-\u9fa5]/g;
let test3 = /[/]/g;
r1.on('line', (line) => {
    try {
        if (-1 != line.indexOf("**")) {
            return;
        }
        if (test0.test(line)) {
            line = line.replace(test0, '');
        }
        if (test2.test(line)) {
            line = line.replace(test2, '');
        }
        if (test1.test(line)) {
            let list = line.split('//');
            line = list[0];
            if (test1.test(line)) {
                let list = line.split('//');
                line = list[0];
            }
        }
        if (test3.test(line)) {
            line = line.replace(test3, '');
        }
        count += 1;
        fWrite.write(line);
    } catch (e) {
        if (e) {
            console.error(e);
        }
    }
});


r1.on('close', (line) => {
    setTimeout(function () {
        readData();
    }, 3000)
});
timer = setTimeout(function () {
}, 1000000);

function readData() {
    try {
        let data = fs.readFileSync(path, 'utf8').replace(/[']/g, '"');
        let client = [], server = [];
        let list = data.split(";");
        function find(str, cha, num) {
            var x = str.indexOf(cha);
            for (var i = 0; i < num; i++) {
                x = str.indexOf(cha, x + 1);
            }
            return x;
        }

        for (let info of list) {
            info = info.trim();
            if (!!info) {
                let index = find(info, '"', 2);
                if (!!index) {
                    info = info.slice(0, index - 1) + ":" + info.slice(index - 1);
                }
                if (-1 != info.indexOf("request")) {
                    info = info.replace('request', '');
                    client.push(info);
                } else {
                    if (-1 != info.indexOf("response")) {
                        info = info.replace('response', '');
                    } else {
                        info = info.replace('push', '');
                    }
                    server.push(info);
                }
            }
        }
        let clientProto = "", serverProto = "";
        for (let i = 0; i < client.length; i++) {
            let info = client[i];
            if (!!info) {
                if (!clientProto) {
                    if(1==client.length){
                        clientProto = "{" + info + "}";
                    }else{
                        clientProto = "{" + info + ",";
                    }
                } else {
                    clientProto = clientProto + info;
                    if (i == client.length - 1) {
                        clientProto = clientProto + "}";
                    } else {
                        clientProto = clientProto + ",";
                    }
                }
            }
        }

        for (let i = 0; i < server.length; i++) {
            let info = server[i];
            if (!!info) {
                if (!serverProto) {
                    if(1==server.length){
                        serverProto = "{" + info + "}";
                    }else{
                        serverProto = "{" + info + ",";
                    }
                } else {
                    serverProto = serverProto + info;
                    if (i == server.length - 1) {
                        serverProto = serverProto + "}";
                    } else {
                        serverProto = serverProto + ",";
                    }
                }
            }
        }
        var formatJson = require('format-json-pretty');
        let clientProtoPath = "./json/clientProto.json", serverProtoPath = "./json/serverProto.json";
        fs.writeFile(clientProtoPath, formatJson(JSON.parse(clientProto)), 'utf8', function (error) {
            if (error) {
                console.log(error);
                return false;
            }
            console.log(clientProtoPath + '写入成功');
        });
        fs.writeFile(serverProtoPath, formatJson(JSON.parse(serverProto)), 'utf8', function (error) {
                if (error) {
                    console.log(error);
                    return false;
                }
                console.log(serverProtoPath + '写入成功');
            }
        )
        ;

        fs.unlink(path, function (error) {
            if (error) {
                console.log(error);
                return false;
            }
            clearTimeout(timer);
            timer = null;
            console.log('删除中转文件成功');
        });
    } catch (e) {
        if (e) {
            console.error(e);
        }
    }
}


