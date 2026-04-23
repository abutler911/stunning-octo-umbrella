#!/usr/bin/env node
require('dotenv').config();
const { Command } = require('commander');
const { initiateCall } = require('./src/caller');
const { listPersonas } = require('./src/personas');

const program = new Command();

program
  .name('spam-callback')
  .description('Call a spam/scam number and waste their time')
  .version('1.0.0');

program
  .command('call <number>')
  .description('Initiate a prank call to a phone number')
  .option('-p, --persona <name>', 'Persona to use', 'grandma')
  .option('-u, --url <url>', 'Override public webhook URL')
  .action(async (number, options) => {
    const publicUrl = options.url || process.env.PUBLIC_URL;

    if (!publicUrl) {
      console.error('Error: PUBLIC_URL not set. Use --url or set it in .env');
      process.exit(1);
    }

    if (!listPersonas().includes(options.persona)) {
      console.error(`Unknown persona "${options.persona}". Available: ${listPersonas().join(', ')}`);
      process.exit(1);
    }

    console.log(`Calling ${number} with persona: ${options.persona}`);

    try {
      const call = await initiateCall(number, options.persona, publicUrl);
      console.log(`Call initiated! SID: ${call.sid}`);
      console.log(`Status: ${call.status}`);
    } catch (err) {
      console.error(`Failed to initiate call: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('personas')
  .description('List available personas')
  .action(() => {
    console.log('Available personas:');
    listPersonas().forEach(name => console.log(`  - ${name}`));
  });

program.parse();
