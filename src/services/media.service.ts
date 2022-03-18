import { ACCESS_TIME_DATA_LAYOUT } from './../utils/util';
import TokenService from '@/services/tokens.service';
import { MediaData } from './../interfaces/media.interface';
import { MediaEntity, AccessTimeEntity } from './../entities/media.entity';
import { CreateMediaDto, PurchaseTimeDto } from './../dtos/media.dto';
import { EntityRepository, Repository } from 'typeorm';
import { TokenEntity } from '@/entities/tokens.entity';
import { PDFDocument } from 'pdf-lib';
import CryptoJS from 'crypto-js';
import fse from 'fs-extra';
import fs from 'fs';
import { CipherParams, NftTokens } from '@/interfaces/tokens.interface';
import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from 'class-validator';
import { Author } from '@/interfaces/authors.interface';
import { AuthorEntity } from '@/entities/author.entity';
import { UserEntity } from '@/entities/users.entity';
import { Keypair, PublicKey, SystemProgram, Connection, TransactionInstruction, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { PROGRAM_ID } from '@/config';
import { AccountLayout, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { logger } from '@/utils/logger';
import ab2str from 'arraybuffer-to-string';

@EntityRepository()
class MediaService extends Repository<TokenEntity> {
  private JsonFormatter = {
    stringify: function (cipherParams: CryptoJS.lib.CipherParams): string {
      // create json object with ciphertext
      const jsonObj: CipherParams = {
        ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64),
      };
      // optionally add iv or salt
      if (cipherParams.iv) {
        jsonObj.iv = cipherParams.iv.toString();
      }
      if (cipherParams.salt) {
        jsonObj.s = cipherParams.salt.toString();
      }
      // stringify json object
      return JSON.stringify(jsonObj);
    },
    parse: function (jsonStr: string): CryptoJS.lib.CipherParams {
      // parse json string
      const jsonObj = JSON.parse(jsonStr);
      // extract ciphertext from json object, and create cipher params object
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
      });
      // optionally extract iv or salt
      if (jsonObj.iv) {
        cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
      }
      if (jsonObj.s) {
        cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
      }
      return cipherParams;
    },
  };

  public async createMedia(mediaData: CreateMediaDto) {
    if (isEmpty(mediaData)) throw new HttpException(400, 'Please enter media data data');

    const findAuthor: Author = await AuthorEntity.findOne(mediaData.author_id, { relations: ['user'] });

    if (!findAuthor) throw new HttpException(409, 'Author not found');

    const fileArrrayBuffer: ArrayBuffer = mediaData.media.data;

    const PdfFile = await PDFDocument.load(fileArrrayBuffer);

    const metadata: MediaData = {
      author: PdfFile.getAuthor(),
      creationDate: PdfFile.getCreationDate(),
      creator: PdfFile.getCreator(),
      indices: PdfFile.getPageIndices(),
      keywords: PdfFile.getKeywords(),
      modificationDate: PdfFile.getModificationDate(),
      pageCount: PdfFile.getPageCount(),
      producer: PdfFile.getProducer(),
      subject: PdfFile.getSubject(),
      title: PdfFile.getTitle(),
    };

    // create nedia NFT

    const tokenService = new TokenService();

    const newMediaKeys: NftTokens = await tokenService.createNFT(
      findAuthor.user.id,
      parseInt(mediaData.price_per_minute),
      parseInt(mediaData.distributor_fee),
    );
    const media = new MediaEntity();

    media.author = findAuthor;
    media.metadata = JSON.stringify(metadata);
    media.title = metadata.title;
    media.public_key = newMediaKeys.public_key;
    media.program_key = newMediaKeys.program_key;

    const createMedia: MediaEntity = await MediaEntity.create(media).save();

    fse.outputFile('../Backend/media/' + createMedia.public_key + '.pdf', mediaData.media.data, err => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    });

    return createMedia;
  }

  public async makeAccessTime(PurchaseTime: PurchaseTimeDto): Promise<string> {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const adminUserData: UserEntity = await UserEntity.findOne(5, { relations: ['wallet'] });

    const privateKeyDecoded = adminUserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const payerSystemAccount = Keypair.fromSecretKey(Uint8Array.from(privateKeyDecoded));

    const buyerUserData: UserEntity = await UserEntity.findOne(PurchaseTime.user_id, { relations: ['wallet'] });

    const buyerPrivateKey = buyerUserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const buyerSystemAccount = Keypair.fromSecretKey(Uint8Array.from(buyerPrivateKey));

    const lvmProgramId = new PublicKey(PROGRAM_ID);

    // create new LVM program account
    const lvmAccount = new Keypair();

    const createLvmAccount = SystemProgram.createAccount({
      space: ACCESS_TIME_DATA_LAYOUT.span,
      lamports: await connection.getMinimumBalanceForRentExemption(ACCESS_TIME_DATA_LAYOUT.span),
      fromPubkey: payerSystemAccount.publicKey,
      newAccountPubkey: lvmAccount.publicKey,
      programId: lvmProgramId,
    });

    const mediaData: MediaEntity = await MediaEntity.findOne(PurchaseTime.media_id, { relations: ['author'] });

    const media_program_account = new PublicKey(mediaData.program_key);

    const authorData: AuthorEntity = await AuthorEntity.findOne(mediaData.author.id, { relations: ['user'] });

    const authorUserData: UserEntity = await UserEntity.findOne(authorData.user.id, { relations: ['wallet'] });

    const authorPrivateKey = authorUserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const authorSystemAccount = Keypair.fromSecretKey(Uint8Array.from(authorPrivateKey));

    const lvmTokenData: TokenEntity = await TokenEntity.findOne(1);

    const authorTokenAccount = await this.getTokenAccount(authorSystemAccount.publicKey);

    const distibutorUserData = await UserEntity.findOne(PurchaseTime.distributor_user_id, { relations: ['wallet'] });

    const distributorPrivateKey = distibutorUserData.wallet.secret_key.split(',').map(s => parseInt(s));

    const distributorSystemAccount = Keypair.fromSecretKey(Uint8Array.from(distributorPrivateKey));

    const distributorTokenAccount = await this.getTokenAccount(distributorSystemAccount.publicKey);

    const buyerTokenAccount = await this.getTokenAccount(buyerSystemAccount.publicKey);

    const lvmToken = new PublicKey(lvmTokenData.public_key);

    // mint some token into buyers account

    await mintTo(connection, payerSystemAccount, lvmToken, buyerTokenAccount, payerSystemAccount, 300);

    // purchase access time

    const purchaseAccessTime = new TransactionInstruction({
      programId: lvmProgramId,
      keys: [
        { pubkey: payerSystemAccount.publicKey, isSigner: true, isWritable: false },
        {
          pubkey: buyerSystemAccount.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: lvmAccount.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: media_program_account,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: authorTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: distributorTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: buyerTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(Uint8Array.of(1, ...new BN(PurchaseTime.time).toArray('le', 8))),
    });

    // create new transaction
    const transaction = new Transaction().add(createLvmAccount, purchaseAccessTime);

    await connection.sendTransaction(transaction, [payerSystemAccount, buyerSystemAccount, lvmAccount], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // save token data

    const accessTime = new AccessTimeEntity();

    accessTime.media = mediaData;
    accessTime.user = buyerUserData;
    accessTime.program_key = lvmAccount.publicKey.toBase58();
    accessTime.total_time = PurchaseTime.time;
    accessTime.time_spent = 0;

    const createAccessTime = await AccessTimeEntity.create(accessTime).save();

    const programAccountSecret = lvmAccount.secretKey;

    const privateKeyToString = Buffer.from(programAccountSecret).toString('base64');

    await this.encryptMedia(mediaData, buyerSystemAccount.publicKey, createAccessTime.program_key, privateKeyToString);

    return lvmAccount.publicKey.toBase58();
  }

  private async getTokenAccount(ownerPublicKey: PublicKey): Promise<PublicKey> {
    const lvmToken: TokenEntity = await TokenEntity.findOne(1);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const authorTokenAccounts = await connection.getTokenAccountsByOwner(ownerPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    for (let index = 0; index < authorTokenAccounts.value.length; index++) {
      const tokenAccount = authorTokenAccounts.value[index];

      const accountInfoData = AccountLayout.decode(tokenAccount.account.data);

      if (accountInfoData.mint.toBase58() == lvmToken.public_key) {
        return tokenAccount.pubkey;
        break;
      }
    }
  }

  private async encryptMedia(mediaData: MediaEntity, userPublicKey: PublicKey, program_key: string, secret_key: string) {
    const filePath = '../Backend/media/' + mediaData.public_key + '.pdf';
    fs.readFile(filePath, async (err, data) => {
      if (!err) {
        const fileContent = data.toString('base64');

        const PdfDocument = await PDFDocument.load(fileContent);

        const decoder = `"${secret_key}"`;

        logger.debug(secret_key);

        const decoderEncrptionKey = program_key + userPublicKey.toBase58();

        const encryptedDecoder = this.encryptFile(decoder, decoderEncrptionKey);

        const encryptedPage = this.encryptFile(fileContent, secret_key);

        const spdfContent = `{
          "metadata": {
            "author": "${PdfDocument.getAuthor()}",
            "creationDate": "${PdfDocument.getCreationDate()}",
            "creator": "${PdfDocument.getCreator()}",
            "indices": "${PdfDocument.getPageIndices()}",
            "keywords": "${PdfDocument.getKeywords()}",
            "modificationDate": "${PdfDocument.getModificationDate()}",
            "pageCount": ${PdfDocument.getPageCount()},
            "producer": "${PdfDocument.getProducer()}",
            "subject": "${PdfDocument.getSubject()}",
            "title": "${PdfDocument.getTitle()}"
            },
            "pages": ${encryptedPage},
            "pubKey": "${program_key}",
            "decoder": ${encryptedDecoder}
          }`;

        fse.outputFile('../Backend/AccessTime/' + program_key + '.spf', spdfContent, err => {
          if (err) {
            console.error(err);
            return;
          }
          //file written successfully
        });
      } else {
        console.log(err);
      }
    });
  }

  // /**
  //  * downloadSpdf
  //  */
  // public downloadSpdf(bookId: string) {

  // }

  private encryptFile(fileData: string, key: string): any {
    const encrypted = CryptoJS.AES.encrypt(fileData, key, {
      format: this.JsonFormatter,
    }); // Encryption: I: WordArray -> O: -> Base64 encoded string (OpenSSL-format)

    return encrypted;
  }

  private decryptFile(encryptedData: string): any {
    const encrypted = this.JsonFormatter.parse(encryptedData);
    const decrypted = CryptoJS.AES.decrypt(encrypted, 'hello world', {
      format: this.JsonFormatter,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export default MediaService;
