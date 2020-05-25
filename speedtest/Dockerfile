FROM balenalib/raspberrypi3-debian-python:3.7.7-run

WORKDIR /app

RUN pip3 install requests influxdb

RUN wget https://bintray.com/ookla/download/download_file?file_path=ookla-speedtest-1.0.0-arm-linux.tgz -O speedtest.tgz

RUN tar -xvf speedtest.tgz

COPY . /app

ENTRYPOINT [ "python", "-u", "speedtest.py" ]