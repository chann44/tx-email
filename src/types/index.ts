import { Address } from "viem"

export interface TransactionDetails {
    hash: string
    from: Address
    to: Address
    value: bigint
    blockNumber: bigint 
    timestamp: number
}

export interface EmailConfig {
    host: string
    port: number
    secure: boolean
    auth:  {
        user: string
        pass: string
    }
    recipent: string

}

export interface MonitorConfig {
    rpcUrl: string;
    wsUrl: string;
    targetAddress: Address;
    startBlock?: bigint; 
}


