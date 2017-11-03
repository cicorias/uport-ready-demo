import winston = require('winston');
import fs = require('fs');
import path = require('path');

import { IEthereumAdapter } from './IEthereumClient';

export class EthereumFileSystemCacheClientDecorator implements IEthereumAdapter {
    private readonly baseClient: IEthereumAdapter;
    private readonly dataRoot: string;

    constructor(baseClient: IEthereumAdapter, dataRoot: string) {
        this.baseClient = baseClient;
        this.dataRoot = dataRoot;
    }

    public async GetBlock(identifier: number): Promise<any> {
        const block = await this.baseClient.GetBlock(identifier);
        this.Save(`Blocks/${block.number}/block.json`, JSON.stringify(block));
        return block;
    }

    public async GetTransaction(txHash: string): Promise<any> {
        const tx = await this.baseClient.GetTransaction(txHash);
        this.Save(`Tx/${txHash}/tx.json`, JSON.stringify(tx));
        return tx;
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        const receipt = await this.baseClient.GetTransactionReceipt(txHash);
        this.Save(`Tx/${txHash}/receipt.json`, JSON.stringify(receipt));
        return receipt;
    }

    public async GetTrace(txHash: string): Promise<any> {
        const trace = await this.baseClient.GetTrace(txHash);
        this.Save(`Tx/${txHash}/trace.json`, JSON.stringify(trace));
        return trace;
    }

    public async GetCode(address: string): Promise<any> {
        const code = await this.baseClient.GetCode(address);
        this.Save(`Addresses/${address}/code.json`, JSON.stringify(code));
        return code;
    }

    private EnsureDirectoryExists(filePath: string) {
        const split = filePath.split(path.sep);
        split.slice(0, -1).reduce((prev, curr, i) => {
            const dir = prev + path.sep + curr;
            if (!fs.existsSync(prev)) {
                fs.mkdirSync(prev);
            }

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return dir;
        });
    }

    private async Save(filePath: string, content: string) {
        const targetPath = path.join(this.dataRoot, filePath);
        return new Promise((resolve, reject) => {
            this.EnsureDirectoryExists(targetPath);
            fs.writeFile(targetPath, content, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}