const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const PORT = process.env.PORT || 2567;
const ROOT = path.join(__dirname, 'public');
const rooms = new Map();
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent((req.url||'/').split('?')[0]);
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(ROOT, requested);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT,'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file,(err,data)=>{ if(err){res.writeHead(404);return res.end('Not found');}
    const ext=path.extname(file); const type=ext==='.html'?'text/html; charset=utf-8':ext==='.js'?'text/javascript; charset=utf-8':'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
  });
});
const wss = new WebSocket.Server({server});
const code = () => Math.random().toString(36).slice(2,8).toUpperCase();
const send=(ws,obj)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj));};
function snapshot(room){return {type:'snapshot',players:[...room.clients].map(c=>({id:c.id,name:c.name,...c.state}))};}
function broadcast(room){const data=JSON.stringify(snapshot(room));for(const c of room.clients)if(c.readyState===WebSocket.OPEN)c.send(data);}
wss.on('connection',ws=>{
  ws.id=code()+code();ws.room=null;ws.name='Игрок';ws.state={x:0,z:0,yaw:0,foot:false,carYaw:0,speed:0,color:'#54b9ff'};
  ws.on('message',raw=>{
    let msg;try{msg=JSON.parse(raw.toString())}catch{return;}
    if(msg.type==='create'||msg.type==='join'){
      if(ws.room)return;
      let roomCode;
      if(msg.type==='create'){do{roomCode=code()}while(rooms.has(roomCode));rooms.set(roomCode,{clients:new Set()});}
      else roomCode=String(msg.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
      const room=rooms.get(roomCode);if(!room)return send(ws,{type:'error',message:'Комната не найдена. Проверь код.'});
      if(room.clients.size>=8)return send(ws,{type:'error',message:'Комната заполнена (максимум 8 игроков).'});
      ws.room=roomCode;ws.name=String(msg.name||'Игрок').slice(0,18);room.clients.add(ws);
      send(ws,{type:'joined',id:ws.id,room:roomCode,players:[...room.clients].map(c=>({id:c.id,name:c.name,...c.state}))});broadcast(room);return;
    }
    if(msg.type==='state'&&ws.room){
      const room=rooms.get(ws.room);if(!room)return;
      const num=(v,old,lim)=>Number.isFinite(v)?Math.max(-lim,Math.min(lim,v)):old;
      ws.state={x:num(msg.x,ws.state.x,10000),z:num(msg.z,ws.state.z,10000),yaw:num(msg.yaw,0,1000),foot:!!msg.foot,carYaw:num(msg.carYaw,0,1000),speed:num(msg.speed,0,500),color:'#54b9ff'};
      broadcast(room);
    }
  });
  ws.on('close',()=>{if(!ws.room)return;const room=rooms.get(ws.room);if(!room)return;room.clients.delete(ws);if(!room.clients.size)rooms.delete(ws.room);else broadcast(room);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`APEX CITY online server listening on ${PORT}`));
