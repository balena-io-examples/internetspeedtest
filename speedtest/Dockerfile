FROM balenalib/raspberrypi3-debian-python:3.7.7-build

WORKDIR /app

RUN pip3 install paho-mqtt 

RUN wget https://install.speedtest.net/app/cli/ookla-speedtest-1.0.0-arm-linux.tgz -O speedtest.tgz

RUN tar -xvf speedtest.tgz

COPY . /app

CMD ["/bin/bash", "run.sh"]
