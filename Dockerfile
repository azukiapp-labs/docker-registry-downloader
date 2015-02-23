FROM azukiapp/dind

RUN apt-get update && \
    apt-get install -qqy nodejs npm &&\
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm i -g gulp
