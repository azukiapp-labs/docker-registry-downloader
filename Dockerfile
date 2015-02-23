FROM azukiapp/dind:ubuntu14

RUN apt-get update && \
    apt-get install -qqy nodejs npm &&\
    ln -s /usr/bin/nodejs /usr/bin/node && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV PATH ./node_modules/.bin:$PATH
