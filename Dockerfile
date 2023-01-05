FROM node:10-stretch-slim

# Install Dependencies
RUN apt-get update && \
  apt-get install --no-install-recommends -y build-essential git libzmq3-dev python nginx curl && \
  rm -rf /var/lib/apt/lists/*
RUN apt-get update
RUN apt-get install ca-certificates -y
RUN update-ca-certificates

# Install flosight
WORKDIR /flosight
ADD https://api.github.com/repos/ranchimall/flocore-node/git/refs/heads/master flocore-node-version.json
RUN git clone https://github.com/ranchimall/flocore-node
ADD https://api.github.com/repos/oipwg/flosight-ui/git/refs/heads/master flosight-ui-version.json
ADD https://api.github.com/repos/oipwg/flosight-api/git/refs/heads/master flosight-api-version.json
RUN npm install ./flocore-node/
RUN npm install flosight-ui flosight-api

# Setup Nginx
RUN service nginx stop && rm /etc/nginx/nginx.conf
WORKDIR /etc/nginx
COPY nginx.conf .
RUN service nginx start

WORKDIR /nginx
COPY http-proxy.conf .

# Add flosight configs
WORKDIR /flosight
COPY start.sh .
COPY flocore-node.json .
COPY healthcheck.js .

RUN mkdir /data
RUN chmod 755 /flosight/start.sh

# Expose used ports
EXPOSE 80 443 3001 7312 7313 17312 17313 17413 41289

HEALTHCHECK CMD node healthcheck.js
CMD ["/flosight/start.sh"]