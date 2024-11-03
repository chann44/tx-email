import "dotenv/config"

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { emailConfig, monitorConfig } from './config';
import { EmailService } from './lib/email';
import { TransactionMonitor } from './lib/monitor';

async function main() {
  try {
    const emailService = new EmailService(emailConfig);
    const monitor = new TransactionMonitor(monitorConfig, emailService);

    // If a start block is specified, fetch past transactions first
    if (monitorConfig.startBlock) {
      const httpClient = createPublicClient({
        chain: mainnet,
        transport: http(monitorConfig.rpcUrl),
      });

      const currentBlock = await httpClient.getBlockNumber();
      await monitor.getPastTransactions(monitorConfig.startBlock, currentBlock);
    }

    // Start monitoring new transactions
    await monitor.start();

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  }
}

main();

