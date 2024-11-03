import {
  createPublicClient,
  webSocket,
  http,
  PublicClient,
  Block,
} from 'viem';
import { mainnet } from 'viem/chains';
import { EmailService } from './email';
import { MonitorConfig, TransactionDetails } from '../types';

export class TransactionMonitor {
  private wsClient: PublicClient;
  private httpClient: PublicClient;
  private emailService: EmailService;
  private config: MonitorConfig;

  constructor(config: MonitorConfig, emailService: EmailService) {
    this.config = config;
    this.emailService = emailService;

    // Initialize both WebSocket and HTTP clients
    this.wsClient = createPublicClient({
      chain: mainnet,
      transport: webSocket(config.wsUrl),
    });

    this.httpClient = createPublicClient({
      chain: mainnet,
      transport: http(config.rpcUrl),
    });
  }

  async start(): Promise<void> {
    console.log(`Starting to monitor transactions for address: ${this.config.targetAddress}`);

    try {
      // Watch new blocks
      this.wsClient.watchBlocks({
        onBlock: (block) => this.handleBlock(block),
        onError: (error) => {
          console.error('Block subscription error:', error);
        },
      });

    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  private async handleBlock(block: Block): Promise<void> {
    try {
      // Get all transactions in the block
      const blockWithTransactions = await this.httpClient.getBlock({
        blockHash: block.hash,
        includeTransactions: true,
      });

      if (!blockWithTransactions.transactions) return;

      // Filter and process transactions
      for (const tx of blockWithTransactions.transactions) {
        if (typeof tx === 'string') continue; // Skip if only hash is provided
        
        if (tx.to?.toLowerCase() === this.config.targetAddress.toLowerCase()) {
          const txDetails: TransactionDetails = {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            blockNumber: blockWithTransactions.number ?? 0n,
            timestamp: Number(blockWithTransactions.timestamp),
          };

          await this.emailService.sendTransactionAlert(txDetails);
        }
      }
    } catch (error) {
      console.error(`Error processing block ${block.hash}:`, error);
    }
  }

  async getPastTransactions(fromBlock: bigint, toBlock: bigint): Promise<void> {
    console.log(`Fetching past transactions from block ${fromBlock} to ${toBlock}`);

    try {
      for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber += 1n) {
        const block = await this.httpClient.getBlock({
          blockNumber,
          includeTransactions: true,
        });

        await this.handleBlock(block);
      }
    } catch (error) {
      console.error('Error fetching past transactions:', error);
    }
  }
}
