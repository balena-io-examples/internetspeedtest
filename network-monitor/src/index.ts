import { getStats } from 'fibertel';
import speedTest from 'speedtest-net';
import axios from 'axios';
var ping = require('ping');

const DEBUG = process.env.DEBUG ?? false;
const SPEEDTEST_INTERVAL_MS = checkInt(process.env.SPEEDTEST_INTERVAL_MS) ?? 60 * 1_000;
const FIBERTEL_INTERVAL_MS = checkInt(process.env.FIBERTEL_INTERVAL_MS) ?? 15 * 60 * 1_000;
const LATENCY_INTERVAL_MS = checkInt(process.env.LATENCY_INTERVAL_MS) ?? 15 * 1_000;
const SPEEDTEST_SERVER_ID = process.env.SPEEDTEST_SERVER_ID;
const ROUTER_IP_ADDRESS = process.env.ROUTER_IP_ADDRESS ?? '192.168.0.1';
const DISABLE_FIBERTEL = checkBool(process.env.DISABLE_FIBERTEL) ?? false;

console.log('Network monitor initialized');
console.log(`- DEBUG: ${DEBUG}}`);
console.log(`- SPEEDTEST_INTERVAL_MS: ${SPEEDTEST_INTERVAL_MS}`);
console.log(`- FIBERTEL_INTERVAL_MS: ${FIBERTEL_INTERVAL_MS}`);
console.log(`- LATENCY_INTERVAL_MS: ${LATENCY_INTERVAL_MS}`);
console.log(`- SPEEDTEST_SERVER_ID: ${SPEEDTEST_SERVER_ID}`);


// LATENCY
setInterval(async () => {
  const hosts = [ {
    ip: '8.8.8.8',
    name: 'google_dns'
  }, {
    ip: '1.1.1.1',
    name: 'cloudflare_dns'
  }, {
    ip: ROUTER_IP_ADDRESS,
    name: 'lan_router'
  }];

  const payload: any = {};

  for(let host of hosts){
    let res = await ping.promise.probe(host.ip);
    payload[`${host.name}_latency`] = res.time;
  }
  pushToConnector('latency', payload);

}, LATENCY_INTERVAL_MS);


// FIBERTEL
setInterval(async () => {
  if (!DISABLE_FIBERTEL) {
    const payload = await getStats();
    pushToConnector('fibertel', { fibertel: payload });
  } else if (DEBUG) {
    console.log('Fitertel stats disabled');
  }
}, LATENCY_INTERVAL_MS);

// SPEEDTEST
setInterval(async () => {
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

  // Get the data and push it to influxdb via connector block
  const payload = {
    speedtest: await speedTest(speedTestOpts)
  };

  pushToConnector('metrics', payload);

}, SPEEDTEST_INTERVAL_MS);

function checkInt(s: string | undefined): number | undefined {
  return s ? parseInt(s) : undefined;
}

function checkBool(s: string | undefined): boolean | undefined {
  return s ? s === 'true' : undefined;
}

async function pushToConnector(name: string, payload: any) {
  if (DEBUG) {
    console.log(`Pushing ${name} data...`);
    console.log(payload);
  }

  try {
    await axios.post('http://connector:8080', payload);
  } catch (error) {
    console.log(error);
  }
}