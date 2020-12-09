# Internet Speed Test
Log your internet download speed, upload speed and latency metrics to InfluxDB, and display it in a Grafana dashboard, all on a Raspberry Pi.

***TLDR:***
Click this to deploy this repository to balenaCloud:

[![](https://balena.io/deploy.svg)](https://dashboard.balena-cloud.com/deploy?repoUrl=https://github.com/balena-io-playground/internetspeedtest)

## Introduction:
The internet now underpins our everyday lives. When our connection goes down we sudden lose a whole bunch of services that we've come to rely on: video calls, email, pictures of cats and more. It's serious stuff, and the quicker we notice, the quicker we join the phone queue to our ISP and start running through the support checklist. "Yes, I have turned it off and on again...."

Or maybe your connection is pretty solid and *seems* to work OK, but you don't really track your connection speed. There's those times where Netflix pauses to buffer some more, just at the important bit of your film. Oh, and it  *feels* as if your connection is slower when other parts of the world wake up. And you suspect that your teenage daughter gaming online uses most of your bandwidth, and you've been wondering if paying for a faster connection would help you all out.
Well wonder no more. This project is for you: it performs an internet test regularly (configurable), puts the results into an Influx database and presents some charts using Grafana. Like these:
![enter image description here](https://i.ibb.co/5knsK8h/internetspeedtest.png)

## Hardware Required
* A raspberry Pi
* 16GB Micro-SD Card (we recommend Sandisk Extreme Pro SD cards)

And that's it.
Actually any of the ARM or aarch64 [devices supported by Balena](https://www.balena.io/os/docs/supported-boards/) will work for this project. Your choice should be influenced by the speed of the internet connection you want to monitor. If your connection is <30Mbit/s then a Pi3 using it's inbuilt WiFi chip might be OK, since you're unlikely to exceed it's throughput. But in general WiFi has too many variables, such as distance from the router and number of walls in the way, so to keep things consistent I would urge you to use a device with an Ethernet port (i.e. anything other than a Pi Zero/W).
Other than that, it's a case of making sure you use a device with enough network throughput to really stretch your broadband pipe. Here's a handy lookup table:
|Broadband Speed|Devices  |  Notes |
|--|--|--|
| <30Mbit/s |RPi 2/3/3b+/4  |100 Mbit/s Ethernet port will be fine.   |
|> 30MBit/s & <300Mbit/s|RPi3B+/4|Both have Gigabit ethernet ports, however the 3b+ is limited to 300Mbit/s by the USB2.0 port.
|>300Mbit/s|RPi 4|The only Pi with true Gigabit ethernet|

For other device types, find the product datasheet and work out if the ethernet port is up to the job.

## Setup and configuration
 It's pretty simple, click this button:

[![](https://balena.io/deploy.png)](https://dashboard.balena-cloud.com/deploy?repoUrl=https://github.com/balena-io-playground/internetspeedtest)

And it will work. Just make the Device URL public:

![enter image description here](https://i.ibb.co/vZbMzT1/public-URL.jpg)

and click the link, and you'll be in the Grafana dashboard checking out your stats.
You can change how frequently the app test your connection, by setting the number of seconds in a `FREQUENCY` device service variable:

![enter image description here](https://i.ibb.co/ym20vC8/config.jpg)

And the eagle-eyed of you will see another variable, `SERVER_ID`. Let me explain:
The speed tester uses [Ookla's Command Line app](https://www.speedtest.net/apps/cli) under the hood, which tries to determine the closest server to you automatically. You could just leave it this way, but I found in my testing that the same server wasn't used each time, and the results were less consistent as a result. To combat this, you can download the CLI (from that link --^) and run the following command:
`Speedtest -L` which will give you an output like:

![enter image description here](https://i.ibb.co/CnCtnSD/servers.jpg)

Then choose a server, note the ID and put it into the `SERVER_ID` variable in your balenaCloud app. That will make the app use the same server each time.

All done - happy monitoring.
