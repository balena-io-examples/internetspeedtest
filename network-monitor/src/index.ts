// import { getStats } from 'fibertel';
import speedTest from 'speedtest-net';
import axios from 'axios';
var ping = require('ping');

const DEBUG = process.env.DEBUG ?? false;
const METRICS_INTERVAL_MS = checkInt(process.env.METRICS_INTERVAL_MS) ?? 60 * 1_000;
const LATENCY_INTERVAL_MS = checkInt(process.env.LATENCY_INTERVAL_MS) ?? 15 * 1_000;
const SPEEDTEST_SERVER_ID = process.env.SPEEDTEST_SERVER_ID;
const ROUTER_IP_ADDRESS = process.env.ROUTER_IP_ADDRESS ?? '192.168.0.1';

console.log('Network monitor initialized');
console.log(`- DEBUG: ${DEBUG}}`);
console.log(`- METRICS_INTERVAL_MS: ${METRICS_INTERVAL_MS}`);
console.log(`- LATENCY_INTERVAL_MS: ${LATENCY_INTERVAL_MS}`);
console.log(`- SPEEDTEST_SERVER_ID: ${SPEEDTEST_SERVER_ID}`);


// LATENCY
setInterval(async () => {
  if (DEBUG) {
    console.log('Pushing latency data...');
  }

  const hosts = [ {
    ip: '8.8.8.8',
    name: 'google_dns'
  }, {
    ip: ROUTER_IP_ADDRESS,
    name: 'lan_router'
  }];

  const payload: any = {};

  try {
    for(let host of hosts){
      let res = await ping.promise.probe(host.ip);
      payload[`${host.name}_latency`] = res.time;
    }
    await axios.post('http://connector:8080', payload);

    if (DEBUG) {
      console.log(payload);
    }
  } catch (error) {
    console.log(error);
  }
}, LATENCY_INTERVAL_MS);

// METRICS
setInterval(async () => {
  if (DEBUG) {
    console.log('Pushing metrics data...');
  }

  // For some reason the speedtest binary errors out with "Error: [54] Cannot read from socket: Connection reset by peer"
  // Adding a high verbosity fixes this (?)
  let speedTestOpts: speedTest.Options = {
    acceptGdpr: true,
    acceptLicense: true,
    verbosity: 4
  }
  if (SPEEDTEST_SERVER_ID) {
    speedTestOpts = { ...speedTestOpts, serverId: SPEEDTEST_SERVER_ID };
  }

  try {
    // Get the data and push it to influxdb via connector block
    const payload = {
      speedtest: await speedTest(speedTestOpts)
      // fibertel: await getStats()
    };

    await axios.post('http://connector:8080', payload);

    if (DEBUG) {
      console.log(payload);
    }
  } catch (error) {
    console.log(error);
  }
}, METRICS_INTERVAL_MS);

function checkInt(s: string | undefined): number | undefined {
  return s ? parseInt(s) : undefined;
}