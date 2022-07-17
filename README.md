# Flosight Docker files
## Command to run the docker

```
docker volume create flosight

docker run -d --name=flosight \
    -p 8080:80 \
    --mount source=flosight,target=/data \
    --env NETWORK=mainnet --env ADDNODE=ranchimall1.duckdns.org \ --env BLOCKCHAIN_BOOTSTRAP=http://servername:port/data.tar.gz
    ranchimallfze/flosight

docker logs -f flosight
```    
