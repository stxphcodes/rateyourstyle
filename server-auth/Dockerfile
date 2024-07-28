FROM debian:bookworm-slim

WORKDIR /

COPY dist/linux-amd64/app .

COPY templates templates

RUN apt-get -y -qq update && \
    apt-get -y -qq --no-install-recommends install ca-certificates
