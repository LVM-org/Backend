import { MEDIA_DATA_LAYOUT } from './../utils/util';
import { EntityRepository, Repository } from 'typeorm';
import { TokenEntity } from '@/entities/tokens.entity';
import {
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import BN = require('bn.js');
import { AuthorityType, createMint, createSetAuthorityInstruction, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { UserEntity } from '@/entities/users.entity';
import { PROGRAM_ID } from '@/config';
import { logger } from '@/utils/logger';
import { NftTokens } from '@/interfaces/tokens.interface';

@EntityRepository()
class TokenService extends Repository<TokenEntity> {
  public async createSpdfToken() {
    const UserData: UserEntity = await UserEntity.findOne(5, { relations: ['wallet'] });

    const privateKeyDecoded = UserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const account = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));
    const freezeAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const airdropSignature = await connection.requestAirdrop(account.publicKey, LAMPORTS_PER_SOL);

    await connection.confirmTransaction(airdropSignature);

    const mint = await createMint(
      connection,
      account,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      9, // We are using 9 to match the CLI decimal default exactly
    );

    const Token = new TokenEntity();

    Token.public_key = mint.toBase58();
    Token.type = 'fungible';
    Token.purpose = 'Spdf Token';

    const createToken = await TokenEntity.create(Token).save();

    return createToken;
  }

  public async createNFT(userId: number, price_per_minute: number, distributor_fee: number): Promise<NftTokens> {
    const UserData: UserEntity = await UserEntity.findOne(userId, { relations: ['wallet'] });

    const privateKeyDecoded = UserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const account = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));
    const freezeAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const airdropSignature = await connection.requestAirdrop(account.publicKey, LAMPORTS_PER_SOL);

    await connection.confirmTransaction(airdropSignature);

    // create NFT

    const mint = await createMint(
      connection,
      account,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      0, // make it zero for NFT
    );

    // create associated token account
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(connection, account, mint, account.publicKey);

    // Mint token into account
    await mintTo(connection, account, mint, associatedTokenAccount.address, account, 1);

    // disable future minting
    const disableMiningTransaction = new Transaction().add(createSetAuthorityInstruction(mint, account.publicKey, AuthorityType.MintTokens, null));

    await sendAndConfirmTransaction(connection, disableMiningTransaction, [account]);

    // create media in the LVM program

    const lvmProgramId = new PublicKey(PROGRAM_ID);

    // create new LVM program account
    const lvmAccount = new Keypair();

    const createLvmAccount = SystemProgram.createAccount({
      space: MEDIA_DATA_LAYOUT.span,
      lamports: await connection.getMinimumBalanceForRentExemption(MEDIA_DATA_LAYOUT.span),
      fromPubkey: account.publicKey,
      newAccountPubkey: lvmAccount.publicKey,
      programId: lvmProgramId,
    });

    // create media

    const createLvmMedia = new TransactionInstruction({
      programId: lvmProgramId,
      keys: [
        { pubkey: account.publicKey, isSigner: true, isWritable: false },
        {
          pubkey: associatedTokenAccount.address,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: lvmAccount.publicKey,
          isSigner: false,
          isWritable: true,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(Uint8Array.of(0, ...new BN(price_per_minute).toArray('le', 8), ...new BN(distributor_fee).toArray('le', 8))),
    });

    // create new transaction
    const transaction = new Transaction().add(createLvmAccount, createLvmMedia);

    logger.debug('Sending create media transaction');

    await connection.sendTransaction(transaction, [account, lvmAccount], { skipPreflight: false, preflightCommitment: 'confirmed' });

    return {
      public_key: mint.toBase58(),
      program_key: lvmAccount.publicKey.toBase58(),
    };
  }
}

export default TokenService;
