FROM golang:1.21.1-bookworm as build

WORKDIR /opt/dist

COPY go.mod .
COPY *go.sum .

RUN go mod download 

COPY . .

RUN go build -o /app

FROM debian:bookworm-slim

WORKDIR /

RUN apt-get -y -qq update && \
    apt-get -y -qq --no-install-recommends install ca-certificates

# TO DO: figure out how to get campaign info
COPY --from=build /opt/dist/campaigns.json /campaigns.json

COPY --from=build /app /app 