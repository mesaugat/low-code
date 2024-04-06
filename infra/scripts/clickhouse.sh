#!/bin/bash

sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates dirmngr

curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg] https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
sudo apt-get install -y clickhouse-server clickhouse-client

echo "* soft nofile 262144\n* hard nofile 262144" | sudo tee /etc/security/limits.conf
sudo sysctl -w vm.swappiness=5

sudo service clickhouse-server start

