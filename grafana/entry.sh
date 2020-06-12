#!/bin/bash

if [ ! -d "/data/grafana/plugins/grafana-image-renderer" ]
then
    grafana-cli --pluginsDir "/data/grafana/plugins" plugins install grafana-image-renderer
    sleep 10
fi

/usr/src/app/api.sh &
exec grafana-server -homepath /usr/share/grafana -config /usr/src/app/grafana.ini
