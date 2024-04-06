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

cat << EOF | sudo tee /etc/clickhouse-server/users.d/default-password.xml
<clickhouse>
  <users>
    <default>
      <password remove='1' />
      <password_sha256_hex>bacfb57e42db80620adee3c752483715b4f7be111be51c4297b0f69b77ef8c0b</password_sha256_hex>
    </default>
  </users>
</clickhouse>
EOF
