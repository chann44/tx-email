import { Address } from 'viem';
import { EmailConfig, MonitorConfig } from './types';


if (!process.env.TARGET_ADDRESS) {
  throw new Error('TARGET_ADDRESS must be set in environment variables');
}

export const emailConfig: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  recipent: process.env.RECIPIENT_EMAIL || '',
};

export const monitorConfig: MonitorConfig = {
  rpcUrl: process.env.RPC_URL || '',
  wsUrl: process.env.WS_URL || '',
  targetAddress: process.env.TARGET_ADDRESS as Address,
  startBlock: process.env.START_BLOCK ? BigInt(process.env.START_BLOCK) : undefined
};
