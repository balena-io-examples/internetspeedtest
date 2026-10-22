FROM arm64v8/python:3.13-slim-bookworm

# Fail if the base image predates the eMudhra CA distrust (bookworm fix: 20250419~deb12u2)
RUN dpkg --compare-versions "$(dpkg-query -W -f='${Version}' ca-certificates)" ge 20250419~deb12u2

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use the system trust store rather than pip's vendored certifi
RUN PIP_CERT=/etc/ssl/certs/ca-certificates.crt pip3 install paho-mqtt==1.6.1

RUN curl -fsSL https://install.speedtest.net/app/cli/ookla-speedtest-1.0.0-aarch64-linux.tgz -o speedtest.tgz

RUN tar -xvf speedtest.tgz

COPY . /app

CMD ["/bin/bash", "run.sh"]
