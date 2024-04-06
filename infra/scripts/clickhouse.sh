#!/bin/bash

apt-get update
apt-get install -y apt-transport-https ca-certificates dirmngr

curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' |  gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg] https://packages.clickhouse.com/deb stable main" |  tee  /etc/apt/sources.list.d/clickhouse.list
apt-get update
apt-get install -y clickhouse-server clickhouse-client

echo "* soft nofile 262144\n* hard nofile 262144" |  tee /etc/security/limits.conf
sysctl -w vm.swappiness=5

cat << EOF | tee /etc/clickhouse-server/users.d/default-password.xml
<clickhouse>
  <users>
    <default>
      <password remove='1' />
      <password_sha256_hex>bacfb57e42db80620adee3c752483715b4f7be111be51c4297b0f69b77ef8c0b</password_sha256_hex>
    </default>
  </users>
</clickhouse>
EOF

service clickhouse-server start

sed -i 's/<!-- <listen_host>::<\/listen_host> -->/<listen_host>::<\/listen_host>/' /etc/clickhouse-server/config.xml
sed -i 's/<readonly>1<\/readonly>/<readonly>2<\/readonly>/' /etc/clickhouse-server/config.xml

sed -i '/<named_collection_control>1<\/named_collection_control>/ a \
\t\t\t\<show_named_collections\>1\<\/show_named_collections\>\
\t\t\t\<show_named_collections_secrets\>1\<\/show_named_collections_secrets\>' /etc/clickhouse-server/users.xml
