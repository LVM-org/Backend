import { Token } from './../interfaces/tokens.interface';
import { TokenEntity } from './../entities/tokens.entity';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { UserEntity } from './../entities/users.entity';
import { Wallet } from './../interfaces/wallets.interface';
import { EntityRepository, Repository } from 'typeorm';
import { WalletEntity } from '@/entities/wallets.entity';
import { HttpException } from '@/exceptions/HttpException';

@EntityRepository()
class WalletService extends Repository<WalletEntity> {
  public async createNewWallet(): Promise<Wallet> {
    const walletTokens = Keypair.generate();

    const wallet = new WalletEntity();

    wallet.public_key = walletTokens.publicKey.toString();
    wallet.secret_key = walletTokens.secretKey.toString();

    const newWallet = WalletEntity.create(wallet).save();

    // create associatedTokenAccount

    const spdfToken: Token = await TokenEntity.findOne({ type: 'fungible' });

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const mint = new PublicKey(spdfToken.public_key);

    // get payer
    const UserData: UserEntity = await UserEntity.findOne(5, { relations: ['wallet'] });

    const privateKeyDecoded = UserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    // create token account

    await getOrCreateAssociatedTokenAccount(connection, payer, mint, walletTokens.publicKey);

    return newWallet;
  }

  public async airdropWallet(userId: string): Promise<String> {
    if (userId == undefined) throw new HttpException(400, 'Provide user id');

    const UserData: UserEntity = await UserEntity.findOne(userId, { relations: ['wallet'] });
    if (!UserData) throw new HttpException(400, 'User not found');

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const payer = new PublicKey(UserData.wallet.public_key);

    const airdropSignature = await connection.requestAirdrop(payer, LAMPORTS_PER_SOL);

    await connection.confirmTransaction(airdropSignature);

    return 'Airdrop completed';
  }
}

export default WalletService;
