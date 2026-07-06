#!/bin/sh
set -x # show comands in execution

docker ps -a

echo "Usuario actual: $(whoami)"
echo ____________________ CLONAR REPO
cd /home/jonbul/servers

CARPETA="ships-vue"

# Comprobar si existe
if [ -d "$CARPETA" ]; then
    cd $CARPETA
    git fetch
    git pull
else
    rm -r -f $CARPETA
    git clone git@github.com:jonbul/ships-vue.git
    cd $CARPETA
fi
# git checkout cleaning

cp -f /home/jonbul/servers/files/.env /home/jonbul/servers/$CARPETA/.env

# create docker network if not exist
docker network inspect ships-network >/dev/null 2>&1 || docker network create ships-network

echo ____________________ NUEVO DOCKER
docker compose up -d --build ships-vue

docker ps -a
