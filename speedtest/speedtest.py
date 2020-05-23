import os
import subprocess
import time
import json
from influxdb import InfluxDBClient

client = InfluxDBClient('localhost', 8086, 'root', 'root', 'speedtest')
client.create_database('speedtest')

class speedtest():
    def test(self):
        p = subprocess.Popen(['./speedtest', '-a', '-f', 'json', '--accept-license', '--accept-gdpr'] , shell=False, stdout=subprocess.PIPE)
        response = p.communicate()
        result = json.loads(response[0])
        print ("Timestamp = " + str(result['timestamp']))
        print ("Down = " + str(result['download']['bandwidth']))
        print ("Up = " + str(result['upload']['bandwidth']))
        print ("Latency = " + str(result['ping']['latency']))
        print ("Jitter = " + str(result['ping']['jitter']))
        #print ("PacketLoss = " + str(result['packetLoss']))
        print ("Interface = " + str(result['interface']))
        print ("Server = " + str(result['server']))
        return result

speedtest = speedtest()

while True:
    result = speedtest.test()
    json_body = [
        {
            "measurement": "download",
            "tags": {
                "up": int(result['upload']['bandwidth']),
                "latency": float(result['ping']['latency']),
                "jitter": float(result['ping']['jitter']),
                #"packetloss": int(result['packetLoss']),
                "interface": str(result['interface']['name']),
                "server": str(result['server']['host'])
            },
            "time": str(result['timestamp']),
            "fields": {
                "value": int(str(result['download']['bandwidth']))
            }
        }
    ]
    print("JSON body = " + str(json_body))
    client.write_points(json_body)
    time.sleep(120)




