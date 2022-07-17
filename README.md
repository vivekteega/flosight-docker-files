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

Open the page http://localhost:8080/api/sync to view the sync status (available API endpoints). After sync is at 100%, you can open the page http://localhost:8080. If you open the homepage while it is still syncing, you will quickly get rate limited, as the UI makes a request for every block update that comes in (this is a bug that may be fixed at some point in the future).

## Environment Variables
Flo Explorer uses Environment Variables to allow for configuration settings. You set the Env Variables in your docker run startup command. Here are the config settings offered by this image.

NETWORK: [mainnet|testnet] The Flo network you wish to run the Flo Explorer on (Default mainnet).
ADDNODE: [ip-address] An IP address of a Flo node to be used as a source of blocks. This is useful if you are running isolated networks, or if you are having a hard time connecting to the network.
CUSTOM_FCOIN_CONFIG: [String] A string (seperated with \n to split lines lines) of extra config variables to add to fcoin.conf (fcoin is the internal Flo Fullnode for the Flo Explorer)

## Intstructions to build the image

```
git clone https://github.com/ranchimall/flosight-docker-files/
cd flosight-docker-files
sudo docker build -t ranchimallfze/flosight:1.0.0 .

