import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import AuthorRoute from './routes/author.route';
import MediaRoute from './routes/media.route';
import TokenRoute from './routes/tokens.route';
import WalletRoute from './routes/wallet.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new TokenRoute(), new WalletRoute(), new MediaRoute(), new AuthorRoute()]);

app.listen();
