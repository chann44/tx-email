import nodemailer from 'nodemailer';
import { formatEther } from 'viem';
import { EmailConfig, TransactionDetails } from '../types/index';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  async sendTransactionAlert(tx: TransactionDetails): Promise<void> {
    const ethValue = formatEther(tx.value);
    const date = new Date(tx.timestamp * 1000).toLocaleString();

    const html = `
      <h2>New Ethereum Transaction Detected!</h2>
      <p><strong>Time:</strong> ${date}</p>
      <p><strong>Block Number:</strong> ${tx.blockNumber.toString()}</p>
      <p><strong>Transaction Hash:</strong> ${tx.hash}</p>
      <p><strong>From:</strong> ${tx.from}</p>
      <p><strong>To:</strong> ${tx.to}</p>
      <p><strong>Value:</strong> ${ethValue} ETH</p>
      <p><a href="https://etherscan.io/tx/${tx.hash}">View on Etherscan</a></p>
    `;

    await this.transporter.sendMail({
      from: this.config.auth.user,
      to: this.config.recipent,
      subject: 'New Ethereum Transaction Alert',
      html,
    });

    console.log(`Email alert sent for transaction: ${tx.hash}`);
  }
}


