while true;do [ "$(curl -v localhost:3000 2>&1|grep Connected)" ] && break;sleep 1;done
node index.js