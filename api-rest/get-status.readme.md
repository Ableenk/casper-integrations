curl --location -g --request POST '{{N1_ADDRESS_RPC}}' \
--data-raw '{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "rpc.discover"
}'