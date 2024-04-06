#!/bin/bash

echo "deb http://repo.yandex.ru/clickhouse/deb/stable/ main/" | sudo tee /etc/apt/sources.list.d/clickhouse.list
echo "* soft nofile 262144\n* hard nofile 262144" | sudo tee /etc/security/limits.conf

sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates dirmngr clickhouse-server clickhouse-client
sudo service clickhouse-server start

sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server

sudo sysctl -w vm.swappiness=5
